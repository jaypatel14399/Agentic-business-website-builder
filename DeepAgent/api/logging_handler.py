"""Custom logging handler that sends logs to WebSocket manager."""

import logging
import asyncio
import threading
from typing import Optional
from queue import Queue


class WebSocketLoggingHandler(logging.Handler):
    """Logging handler that broadcasts log messages via WebSocket."""
    
    def __init__(self, job_id: Optional[str] = None):
        """
        Initialize WebSocket logging handler.
        
        Args:
            job_id: Optional job ID. If None, logs won't be broadcast.
        """
        super().__init__()
        self.job_id = job_id
        self.message_queue = Queue()
        self.setFormatter(logging.Formatter(
            '%(asctime)s - %(name)s - %(levelname)s - %(message)s',
            datefmt='%Y-%m-%d %H:%M:%S'
        ))
    
    def set_job_id(self, job_id: str):
        """
        Set the job ID for this handler.
        
        Args:
            job_id: Job ID to broadcast logs to.
        """
        self.job_id = job_id
    
    def emit(self, record: logging.LogRecord):
        """
        Emit a log record to WebSocket.
        
        Args:
            record: Log record to emit.
        """
        if not self.job_id:
            return
        
        try:
            # Format the message
            message = self.format(record)
            
            # Get WebSocket manager
            from api.websocket_manager import websocket_manager
            
            # Try to get or create event loop
            try:
                loop = asyncio.get_event_loop()
            except RuntimeError:
                # Create new event loop in this thread
                loop = asyncio.new_event_loop()
                asyncio.set_event_loop(loop)
            
            # Schedule broadcast
            try:
                if loop.is_running():
                    # If loop is running, schedule as task
                    asyncio.run_coroutine_threadsafe(
                        websocket_manager.broadcast_log(
                            job_id=self.job_id,
                            level=record.levelname,
                            message=message,
                            logger_name=record.name
                        ),
                        loop
                    )
                else:
                    # If loop is not running, run it
                    loop.run_until_complete(
                        websocket_manager.broadcast_log(
                            job_id=self.job_id,
                            level=record.levelname,
                            message=message,
                            logger_name=record.name
                        )
                    )
            except Exception as e:
                # Fallback: just print if WebSocket broadcast fails
                # This prevents logging errors from breaking the application
                pass
        except Exception as e:
            # Don't let logging errors break the application
            # Silently fail to avoid recursion
            pass
