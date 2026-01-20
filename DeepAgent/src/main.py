"""Main CLI entry point for the Multi-Agent Business Website Generator."""

import sys
import logging
from pathlib import Path

import click

from src.utils.config import get_config
from src.agents.orchestrator import OrchestratorAgent


# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S'
)

logger = logging.getLogger(__name__)


@click.command()
@click.option(
    '--industry',
    required=True,
    help='Industry keyword (e.g., "roofing", "plumbing")'
)
@click.option(
    '--city',
    required=True,
    help='City name (e.g., "Austin")'
)
@click.option(
    '--state',
    required=True,
    help='State abbreviation (e.g., "TX")'
)
@click.option(
    '--limit',
    type=int,
    default=None,
    help='Limit number of businesses to process'
)
@click.option(
    '--verbose',
    is_flag=True,
    help='Enable verbose (DEBUG) logging'
)
@click.option(
    '--quiet',
    is_flag=True,
    help='Minimal output (WARNING level only)'
)
def main(industry: str, city: str, state: str, limit: int, verbose: bool, quiet: bool):
    """
    Multi-Agent Business Website Generator CLI.
    
    Discovers local businesses without websites, analyzes competitors,
    and generates SEO-optimized Next.js websites.
    """
    # Configure logging level based on flags
    if verbose:
        logging.getLogger().setLevel(logging.DEBUG)
        logger.debug("Verbose logging enabled")
    elif quiet:
        logging.getLogger().setLevel(logging.WARNING)
    else:
        logging.getLogger().setLevel(logging.INFO)
    
    # Display startup message
    click.echo(click.style(
        "\n🚀 Multi-Agent Business Website Generator\n",
        fg='cyan',
        bold=True
    ))
    
    click.echo(f"Industry: {click.style(industry, fg='yellow', bold=True)}")
    click.echo(f"Location: {click.style(f'{city}, {state}', fg='yellow', bold=True)}")
    if limit:
        click.echo(f"Limit: {click.style(str(limit), fg='yellow', bold=True)}")
    click.echo()
    
    try:
        # Initialize configuration
        try:
            click.echo("📋 Initializing configuration...")
            config = get_config()
            click.echo(click.style("✓ Configuration loaded", fg='green'))
        except ValueError as e:
            click.echo(
                click.style(f"❌ Configuration error: {str(e)}", fg='red', bold=True),
                err=True
            )
            click.echo(
                click.style(
                    "\nPlease check your .env file or set the required environment variables.\n"
                    "See .env.example for required variables.",
                    fg='yellow'
                ),
                err=True
            )
            sys.exit(1)
        except Exception as e:
            click.echo(
                click.style(f"❌ Error loading configuration: {str(e)}", fg='red', bold=True),
                err=True
            )
            sys.exit(1)
        
        # Initialize orchestrator
        try:
            click.echo("🤖 Initializing orchestrator agent...")
            orchestrator = OrchestratorAgent(config)
            click.echo(click.style("✓ Orchestrator initialized", fg='green'))
        except Exception as e:
            click.echo(
                click.style(
                    f"❌ Error initializing orchestrator: {str(e)}",
                    fg='red',
                    bold=True
                ),
                err=True
            )
            logger.exception("Error initializing orchestrator")
            sys.exit(1)
        
        click.echo()
        click.echo(click.style("Starting website generation workflow...\n", fg='cyan', bold=True))
        
        # Execute workflow
        try:
            generated_paths = orchestrator.generate_websites(
                industry=industry,
                city=city,
                state=state,
                limit=limit
            )
            
            # Display results
            click.echo()
            click.echo(click.style("=" * 60, fg='cyan'))
            click.echo(click.style("📊 Results Summary", fg='cyan', bold=True))
            click.echo(click.style("=" * 60, fg='cyan'))
            click.echo()
            
            if generated_paths:
                click.echo(
                    click.style(
                        f"✓ Successfully generated {len(generated_paths)} website(s)",
                        fg='green',
                        bold=True
                    )
                )
                click.echo()
                click.echo(click.style("Generated websites:", fg='yellow', bold=True))
                
                for idx, path in enumerate(generated_paths, 1):
                    # Convert to relative path for display
                    try:
                        rel_path = path.relative_to(Path.cwd())
                    except ValueError:
                        rel_path = path
                    
                    click.echo(
                        f"  {idx}. {click.style(str(rel_path), fg='blue')}"
                    )
                
                click.echo()
                click.echo(
                    click.style(
                        f"💡 Websites are ready in: {config.output_dir}/",
                        fg='green'
                    )
                )
            else:
                click.echo(
                    click.style(
                        "⚠ No websites were generated.",
                        fg='yellow',
                        bold=True
                    )
                )
                click.echo(
                    "This could mean:\n"
                    "  - All discovered businesses already have websites\n"
                    "  - No businesses were found in the specified location\n"
                    "  - Errors occurred during generation (check logs)"
                )
            
            click.echo()
            click.echo(click.style("=" * 60, fg='cyan'))
            
            # Exit with success
            sys.exit(0)
            
        except KeyboardInterrupt:
            click.echo()
            click.echo(
                click.style(
                    "\n⚠ Process interrupted by user",
                    fg='yellow',
                    bold=True
                )
            )
            sys.exit(130)  # Standard exit code for Ctrl+C
        except Exception as e:
            click.echo()
            click.echo(
                click.style(
                    f"❌ Error during workflow execution: {str(e)}",
                    fg='red',
                    bold=True
                ),
                err=True
            )
            logger.exception("Error during workflow execution")
            sys.exit(1)
    
    except Exception as e:
        click.echo(
            click.style(
                f"❌ Unexpected error: {str(e)}",
                fg='red',
                bold=True
            ),
            err=True
        )
        logger.exception("Unexpected error")
        sys.exit(1)


if __name__ == '__main__':
    main()
