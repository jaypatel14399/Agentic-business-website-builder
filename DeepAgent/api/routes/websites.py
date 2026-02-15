"""Website management API routes."""

import json
import logging
import os
import signal
import subprocess
import time
import urllib.request
from pathlib import Path
from typing import List
from datetime import datetime

from fastapi import APIRouter, HTTPException
from fastapi.responses import FileResponse

from api.models.job import WebsiteInfo, WebsiteListResponse
from api.storage.job_storage import job_storage

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/websites", tags=["websites"])

# Dev server ports: each site gets its own port so multiple sites can run at once
DEV_SERVER_PORT_START = 3001
DEV_SERVER_PORT_END = 3020
_site_ports: dict = {}  # site_id -> port (in-memory, resets on backend restart)


def _get_site_path(site_id: str) -> Path:
    """Resolve path to generated site directory (same as NextJSGenerator output)."""
    from src.utils.config import get_config
    return get_config().get_output_path() / site_id


@router.get("", response_model=WebsiteListResponse)
async def list_websites():
    """
    List all generated websites from jobs, plus any site folders found on disk
    (so the list stays correct after backend restart when job storage is in-memory).
    """
    try:
        output_path = _get_site_path("")  # output dir (e.g. generated_sites)
        all_websites = []
        seen_paths = set()

        # 1) From job storage
        for job in job_storage.list_jobs():
            for website in getattr(job, "generated_websites", []) or []:
                if website.path not in seen_paths:
                    all_websites.append(website)
                    seen_paths.add(website.path)

        # 2) Fallback: scan output directory for site folders (covers post-restart)
        if output_path.is_dir():
            for child in output_path.iterdir():
                if child.is_dir() and not child.name.startswith("."):
                    path_str = str(child)
                    if path_str not in seen_paths:
                        try:
                            mtime = child.stat().st_mtime
                            created = datetime.fromtimestamp(mtime)
                        except Exception:
                            created = datetime.now()
                        name = child.name.replace("-", " ").title()
                        all_websites.append(
                            WebsiteInfo(
                                site_id=child.name,
                                business_name=name,
                                path=path_str,
                                created_at=created,
                            )
                        )
                        seen_paths.add(path_str)

        # Sort by creation time (newest first)
        all_websites.sort(key=lambda w: w.created_at, reverse=True)

        return WebsiteListResponse(
            websites=all_websites,
            total=len(all_websites)
        )
    
    except Exception as e:
        logger.error(f"Error listing websites: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to list websites: {str(e)}")


@router.get("/{site_id}", response_model=WebsiteInfo)
async def get_website(site_id: str):
    """
    Get website information by site ID.
    
    Args:
        site_id: Site ID (directory name).
    
    Returns:
        Website information.
    """
    try:
        # Search through all jobs
        all_jobs = job_storage.list_jobs()
        
        for job in all_jobs:
            for website in job.generated_websites:
                if website.site_id == site_id:
                    return website
        
        raise HTTPException(status_code=404, detail=f"Website {site_id} not found")
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error getting website {site_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to get website: {str(e)}")


def _ensure_build_required_files(site_path: Path) -> None:
    """Ensure globals.css, SEO/ContactForm components, and tsconfig baseUrl exist so build does not fail."""
    app_dir = site_path / "src" / "app"
    components_dir = site_path / "src" / "components"
    globals_css = app_dir / "globals.css"
    if not globals_css.is_file():
        app_dir.mkdir(parents=True, exist_ok=True)
        globals_css.write_text(
            "@tailwind base;\n@tailwind components;\n@tailwind utilities;\n"
            "body { font-family: system-ui, sans-serif; }\n",
            encoding="utf-8",
        )
        logger.info("Wrote missing %s", globals_css)
    seo_tsx = components_dir / "SEO.tsx"
    if not seo_tsx.is_file():
        components_dir.mkdir(parents=True, exist_ok=True)
        seo_tsx.write_text("export default function SEO() {\n  return <></>;\n}\n", encoding="utf-8")
        logger.info("Wrote missing %s", seo_tsx)
    contact_form_tsx = components_dir / "ContactForm.tsx"
    if not contact_form_tsx.is_file():
        components_dir.mkdir(parents=True, exist_ok=True)
        contact_form_tsx.write_text(
            "'use client'\n\nexport default function ContactForm() {\n"
            "  return (\n    <form className=\"space-y-4\">\n"
            "      <p>Contact form will be available soon.</p>\n    </form>\n  );\n}\n",
            encoding="utf-8",
        )
        logger.info("Wrote missing %s", contact_form_tsx)
    # Ensure home and services pages exist (fix 404)
    app_dir = site_path / "src" / "app"
    home_page = app_dir / "page.tsx"
    if not home_page.is_file():
        app_dir.mkdir(parents=True, exist_ok=True)
        home_page.write_text(
            "import Link from 'next/link'\nimport SEO from '@/components/SEO'\n\n"
            "export default function Home() {\n  return (\n    <>\n      <SEO />\n"
            '      <section className="min-h-[60vh] flex items-center justify-center px-4">\n'
            "        <div className=\"text-center\">\n"
            "          <h1 className=\"text-4xl font-bold mb-4\">Welcome</h1>\n"
            "          <p className=\"text-lg text-content-muted mb-8\">Get in touch with us today.</p>\n"
            "          <Link href=\"/contact\" className=\"inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold\">Contact Us</Link>\n"
            "        </div>\n      </section>\n    </>\n  )\n}\n",
            encoding="utf-8",
        )
        logger.info("Wrote missing %s", home_page)
    services_dir = app_dir / "services"
    services_page = services_dir / "page.tsx"
    if not services_page.is_file():
        services_dir.mkdir(parents=True, exist_ok=True)
        services_page.write_text(
            "import Link from 'next/link'\nimport SEO from '@/components/SEO'\n\n"
            "export default function ServicesPage() {\n  return (\n    <>\n      <SEO />\n"
            '      <section className="py-20 px-4">\n        <div className="max-w-4xl mx-auto text-center">\n'
            "          <h1 className=\"text-4xl font-bold mb-4\">Our Services</h1>\n"
            "          <p className=\"text-content-muted mb-8\">Professional services tailored to your needs.</p>\n"
            "          <Link href=\"/contact\" className=\"inline-block bg-primary text-white px-6 py-3 rounded-lg font-semibold\">Get in Touch</Link>\n"
            "        </div>\n      </section>\n    </>\n  )\n}\n",
            encoding="utf-8",
        )
        logger.info("Wrote missing %s", services_page)
    # Ensure tsconfig has baseUrl so @/ path alias resolves in Next.js
    tsconfig_path = site_path / "tsconfig.json"
    if tsconfig_path.is_file():
        try:
            text = tsconfig_path.read_text(encoding="utf-8")
            ts = json.loads(text)
            co = ts.get("compilerOptions") or {}
            if co.get("baseUrl") != ".":
                co["baseUrl"] = "."
                ts["compilerOptions"] = co
                tsconfig_path.write_text(json.dumps(ts, indent=2), encoding="utf-8")
                logger.info("Added baseUrl to %s", tsconfig_path)
        except Exception as e:
            logger.warning("Could not patch tsconfig.json: %s", e)


def _kill_process_on_port(port: int) -> None:
    """Kill any process listening on the given port (Unix: lsof + kill)."""
    try:
        out = subprocess.run(
            ["lsof", "-ti", f":{port}"],
            capture_output=True,
            text=True,
            timeout=5,
        )
        if out.returncode == 0 and out.stdout.strip():
            for pid_str in out.stdout.strip().split():
                try:
                    os.kill(int(pid_str), signal.SIGKILL)
                    logger.info("Killed process %s on port %s", pid_str, port)
                except (ValueError, ProcessLookupError, OSError):
                    pass
    except (subprocess.TimeoutExpired, FileNotFoundError):
        pass


def _get_port_for_site(site_id: str) -> int:
    """Assign or return the port for this site so each site runs on its own port."""
    if site_id in _site_ports:
        return _site_ports[site_id]
    in_use = set(_site_ports.values())
    for port in range(DEV_SERVER_PORT_START, DEV_SERVER_PORT_END + 1):
        if port not in in_use:
            _site_ports[site_id] = port
            return port
    # Fallback: reuse port 3001 if all taken (will kill existing on 3001)
    _site_ports[site_id] = DEV_SERVER_PORT_START
    return DEV_SERVER_PORT_START


def _wait_for_url(url: str, timeout_seconds: int = 90, interval: float = 0.8) -> bool:
    """Poll URL until it returns 200 or timeout."""
    deadline = time.monotonic() + timeout_seconds
    while time.monotonic() < deadline:
        try:
            req = urllib.request.Request(url, method="GET")
            with urllib.request.urlopen(req, timeout=3) as resp:
                if resp.status == 200:
                    return True
        except Exception:
            pass
        time.sleep(interval)
    return False


@router.post("/{site_id}/build")
async def build_website(site_id: str):
    """
    Run npm install and npm run build in the generated site folder.
    Returns preview URL to open the built site.
    """
    try:
        site_path = _get_site_path(site_id)
        if not site_path.is_dir():
            raise HTTPException(status_code=404, detail=f"Site directory not found: {site_id}")
        if not (site_path / "package.json").is_file():
            raise HTTPException(
                status_code=400,
                detail=(
                    "Site was not fully generated (missing package.json). "
                    "Try generating the website again from the start."
                ),
            )

        _ensure_build_required_files(site_path)

        for cmd, cwd in [
            (["npm", "install"], site_path),
            (["npm", "run", "build"], site_path),
        ]:
            result = subprocess.run(
                cmd,
                cwd=str(cwd),
                capture_output=True,
                text=True,
                timeout=300,
            )
            if result.returncode != 0:
                logger.warning(f"Build step failed: {' '.join(cmd)} stderr: {result.stderr}")
                raise HTTPException(
                    status_code=500,
                    detail=f"Build failed: {result.stderr or result.stdout or 'Unknown error'}",
                )

        return {
            "success": True,
            "preview_url": f"/api/preview/{site_id}/",
        }
    except HTTPException:
        raise
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="Build timed out")
    except Exception as e:
        logger.error(f"Error building website {site_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.post("/{site_id}/start-dev")
async def start_dev_server(site_id: str):
    """
    Run npm install, then start the dev server (npm run dev) in the generated site folder.
    Waits until the server is ready, then returns the localhost URL to open in the browser.
    """
    try:
        site_path = _get_site_path(site_id)
        if not site_path.is_dir():
            raise HTTPException(status_code=404, detail=f"Site directory not found: {site_id}")
        if not (site_path / "package.json").is_file():
            raise HTTPException(
                status_code=400,
                detail=(
                    "Site was not fully generated (missing package.json). "
                    "Try generating the website again from the start."
                ),
            )

        _ensure_build_required_files(site_path)

        # npm install
        install_result = subprocess.run(
            ["npm", "install"],
            cwd=str(site_path),
            capture_output=True,
            text=True,
            timeout=120,
        )
        if install_result.returncode != 0:
            logger.warning("npm install failed: %s", install_result.stderr)
            raise HTTPException(
                status_code=500,
                detail=f"npm install failed: {install_result.stderr or install_result.stdout or 'Unknown error'}",
            )

        port = _get_port_for_site(site_id)
        _kill_process_on_port(port)
        time.sleep(1)

        url = f"http://localhost:{port}"
        env = {**os.environ, "PORT": str(port)}

        popen_kw = {
            "cwd": str(site_path),
            "env": env,
            "stdout": subprocess.DEVNULL,
            "stderr": subprocess.DEVNULL,
        }
        if os.name != "nt":
            popen_kw["start_new_session"] = True
        proc = subprocess.Popen(["npm", "run", "dev"], **popen_kw)

        try:
            if not _wait_for_url(url, timeout_seconds=90):
                proc.kill()
                raise HTTPException(
                    status_code=504,
                    detail="Dev server did not become ready in time. Check the site folder and try again.",
                )
        except HTTPException:
            proc.kill()
            raise

        return {"success": True, "url": url}
    except HTTPException:
        raise
    except subprocess.TimeoutExpired:
        raise HTTPException(status_code=504, detail="npm install timed out")
    except Exception as e:
        logger.error(f"Error starting dev server for {site_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=str(e))


@router.delete("/{site_id}", status_code=204)
async def delete_website(site_id: str):
    """
    Delete a generated website.
    
    Args:
        site_id: Site ID (directory name).
    
    Returns:
        No content on success.
    """
    try:
        website_path = None
        for job in job_storage.list_jobs():
            for website in getattr(job, "generated_websites", []) or []:
                if website.site_id == site_id:
                    website_path = Path(website.path)
                    break
            if website_path:
                break
        if not website_path:
            # Fallback: site may have been listed from disk scan only
            website_path = _get_site_path(site_id)
        if not website_path or not website_path.is_dir():
            raise HTTPException(status_code=404, detail=f"Website {site_id} not found")
        
        # Delete the directory
        if website_path.exists():
            import shutil
            shutil.rmtree(website_path)
            logger.info(f"Deleted website directory: {website_path}")
        else:
            logger.warning(f"Website directory does not exist: {website_path}")
        
        # Note: We don't remove it from job_storage for historical record
        # In a production system, you might want to mark it as deleted
        
        from fastapi.responses import JSONResponse
        return JSONResponse(status_code=204, content=None)
    
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Error deleting website {site_id}: {str(e)}", exc_info=True)
        raise HTTPException(status_code=500, detail=f"Failed to delete website: {str(e)}")
