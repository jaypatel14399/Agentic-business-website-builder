"""WebSocket manager for real-time log broadcasting."""

import asyncio
import json
import logging
from typing import Dict, Set
from datetime import datetime

from fastapi import WebSocket, WebSocketDisconnect


logger = logging.getLogger(__name__)


class WebSocketManager:
    """Manages WebSocket connections and broadcasts messages to clients."""
    
    def __init__(self):
        """Initialize WebSocket manager."""
        # Map of job_id -> set of WebSocket connections
        self.active_connections: Dict[str, Set[WebSocket]] = {}
        # Lock for thread-safe operations
        self.lock = asyncio.Lock()
    
    async def connect(self, websocket: WebSocket, job_id: str):
        """
        Accept a new WebSocket connection for a specific job.
        
        Args:
            websocket: WebSocket connection.
            job_id: Job ID to associate with this connection.
        """
        await websocket.accept()
        
        async with self.lock:
            if job_id not in self.active_connections:
                self.active_connections[job_id] = set()
            self.active_connections[job_id].add(websocket)
        
        logger.info(f"WebSocket connected for job {job_id}. Total connections: {len(self.active_connections.get(job_id, set()))}")
    
    async def disconnect(self, websocket: WebSocket, job_id: str):
        """
        Remove a WebSocket connection.
        
        Args:
            websocket: WebSocket connection to remove.
            job_id: Job ID associated with the connection.
        """
        async with self.lock:
            if job_id in self.active_connections:
                self.active_connections[job_id].discard(websocket)
                if not self.active_connections[job_id]:
                    del self.active_connections[job_id]
        
        logger.info(f"WebSocket disconnected for job {job_id}")
    
    async def send_personal_message(self, message: dict, websocket: WebSocket):
        """
        Send a message to a specific WebSocket connection.
        
        Args:
            message: Message dictionary to send.
            websocket: WebSocket connection to send to.
        """
        try:
            await websocket.send_json(message)
        except Exception as e:
            logger.error(f"Error sending message to WebSocket: {str(e)}")
    
    async def broadcast_to_job(self, job_id: str, message: dict):
        """
        Broadcast a message to all connections for a specific job.
        
        Args:
            job_id: Job ID to broadcast to.
            message: Message dictionary to broadcast.
        """
        if job_id not in self.active_connections:
            return
        
        # Get a copy of connections to avoid modification during iteration
        async with self.lock:
            connections = list(self.active_connections.get(job_id, set()))
        
        # Send to all connections, removing dead ones
        dead_connections = []
        for connection in connections:
            try:
                await connection.send_json(message)
            except Exception as e:
                logger.warning(f"Error broadcasting to connection: {str(e)}")
                dead_connections.append(connection)
        
        # Remove dead connections
        if dead_connections:
            async with self.lock:
                if job_id in self.active_connections:
                    for dead_conn in dead_connections:
                        self.active_connections[job_id].discard(dead_conn)
                    if not self.active_connections[job_id]:
                        del self.active_connections[job_id]
    
    async def broadcast_log(self, job_id: str, level: str, message: str, logger_name: str = ""):
        """
        Broadcast a log message to all connections for a job.
        
        Args:
            job_id: Job ID to broadcast to.
            level: Log level (DEBUG, INFO, WARNING, ERROR).
            message: Log message.
            logger_name: Name of the logger that generated the message.
        """
        log_message = {
            "type": "log",
            "timestamp": datetime.now().isoformat(),
            "level": level,
            "message": message,
            "logger": logger_name
        }
        await self.broadcast_to_job(job_id, log_message)
    
    async def broadcast_progress(self, job_id: str, step: str, progress: float, details: dict = None):
        """
        Broadcast a progress update to all connections for a job.
        
        Args:
            job_id: Job ID to broadcast to.
            step: Current step name.
            progress: Progress percentage (0-100).
            details: Additional progress details.
        """
        progress_message = {
            "type": "progress",
            "timestamp": datetime.now().isoformat(),
            "step": step,
            "progress": progress,
            "details": details or {}
        }
        await self.broadcast_to_job(job_id, progress_message)
    
    def get_connection_count(self, job_id: str) -> int:
        """
        Get the number of active connections for a job.
        
        Args:
            job_id: Job ID.
        
        Returns:
            Number of active connections.
        """
        return len(self.active_connections.get(job_id, set()))


# Global WebSocket manager instance
websocket_manager = WebSocketManager()
