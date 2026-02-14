"""Visual Agent - Browser automation and GUI interaction."""

import asyncio
from dataclasses import dataclass, field
from enum import Enum
from pathlib import Path
from typing import Any

from pydantic import BaseModel, Field

from helpermcp.core import settings


class ToolType(str, Enum):
    """Types of tools that can be generated."""
    
    API = "api"           # REST/GraphQL API calls
    BROWSER = "browser"   # Playwright browser automation
    SCRAPER = "scraper"   # CSS selector extraction
    DESKTOP = "desktop"   # PyAutoGUI desktop automation
    COMPOSITE = "composite"  # Combination of multiple tools


@dataclass
class BrowserStep:
    """A single step in a browser workflow."""
    
    action: str  # click, input, wait, scroll, screenshot
    selector: str = ""
    value: str = ""
    description: str = ""


@dataclass
class DesktopStep:
    """A single step in a desktop automation workflow."""
    
    action: str  # click, type, hotkey, screenshot, find_image
    target: str = ""  # Image path or coordinates
    value: str = ""
    description: str = ""


class VisualAgent:
    """
    Agent for creating visual automation tools.
    
    Capabilities:
    - Browser workflows using Playwright/browser-use
    - Desktop automation using PyAutoGUI
    - Screenshot-based element detection
    """

    def __init__(self):
        self._browser = None
        self._playwright = None

    async def create_browser_workflow(
        self,
        name: str,
        description: str,
        start_url: str,
        steps: list[BrowserStep],
    ) -> str:
        """
        Create a browser automation tool from workflow steps.
        
        Args:
            name: Tool name
            description: What the tool does
            start_url: Starting URL
            steps: List of browser steps
            
        Returns:
            Generated Python code for the MCP tool
        """
        # Generate step code
        step_code = ""
        for i, step in enumerate(steps):
            step_code += self._generate_browser_step(step, i)
        
        code = f'''
@mcp.tool()
async def {name}(
    start_url: str = Field("{start_url}", description="Starting URL"),
) -> dict[str, Any]:
    """
    {description}
    
    Tool Type: BROWSER
    Steps: {len(steps)}
    """
    from playwright.async_api import async_playwright
    
    async with async_playwright() as p:
        browser = await p.chromium.launch(headless=True)
        context = await browser.new_context()
        page = await context.new_page()
        
        results = {{}}
        
        try:
            await page.goto(start_url, wait_until="networkidle")
            
{step_code}
            
            results["success"] = True
            
        except Exception as e:
            results["success"] = False
            results["error"] = str(e)
        finally:
            await browser.close()
        
        return results
'''
        return code

    def _generate_browser_step(self, step: BrowserStep, index: int) -> str:
        """Generate code for a single browser step."""
        indent = "            "
        
        if step.action == "click":
            return f'{indent}# Step {index + 1}: {step.description or "Click element"}\n{indent}await page.click("{step.selector}")\n{indent}await page.wait_for_load_state("networkidle", timeout=5000)\n\n'
        
        elif step.action == "input":
            return f'{indent}# Step {index + 1}: {step.description or "Enter text"}\n{indent}await page.fill("{step.selector}", "{step.value}")\n\n'
        
        elif step.action == "wait":
            seconds = step.value or "1"
            return f'{indent}# Step {index + 1}: {step.description or "Wait"}\n{indent}await asyncio.sleep({seconds})\n\n'
        
        elif step.action == "scroll":
            return f'{indent}# Step {index + 1}: {step.description or "Scroll"}\n{indent}await page.evaluate("window.scrollTo(0, document.body.scrollHeight)")\n\n'
        
        elif step.action == "screenshot":
            return f'{indent}# Step {index + 1}: {step.description or "Take screenshot"}\n{indent}await page.screenshot(path="{step.value or "screenshot.png"}")\n\n'
        
        elif step.action == "extract":
            return f'{indent}# Step {index + 1}: {step.description or "Extract data"}\n{indent}element = await page.query_selector("{step.selector}")\n{indent}if element:\n{indent}    results["{step.value or "extracted"}"] = await element.text_content()\n\n'
        
        elif step.action == "submit":
            return f'{indent}# Step {index + 1}: {step.description or "Submit form"}\n{indent}await page.click("{step.selector}")\n{indent}await page.wait_for_load_state("networkidle")\n\n'
        
        return f'{indent}# Step {index + 1}: Unknown action "{step.action}"\n{indent}pass\n\n'

    async def create_desktop_automation(
        self,
        name: str,
        description: str,
        app_name: str,
        steps: list[DesktopStep],
    ) -> str:
        """
        Create a desktop automation tool using PyAutoGUI.
        
        Args:
            name: Tool name
            description: What the tool does
            app_name: Application to automate
            steps: List of desktop steps
            
        Returns:
            Generated Python code for the MCP tool
        """
        step_code = ""
        for i, step in enumerate(steps):
            step_code += self._generate_desktop_step(step, i)
        
        code = f'''
@mcp.tool()
async def {name}() -> dict[str, Any]:
    """
    {description}
    
    Tool Type: DESKTOP
    Application: {app_name}
    Steps: {len(steps)}
    """
    import pyautogui
    import time
    
    results = {{"app": "{app_name}"}}
    
    try:
        # Safety settings
        pyautogui.FAILSAFE = True
        pyautogui.PAUSE = 0.5
        
{step_code}
        
        results["success"] = True
        
    except Exception as e:
        results["success"] = False
        results["error"] = str(e)
    
    return results
'''
        return code

    def _generate_desktop_step(self, step: DesktopStep, index: int) -> str:
        """Generate code for a single desktop step."""
        indent = "        "
        
        if step.action == "click":
            if step.target:
                # Image-based click
                return f'{indent}# Step {index + 1}: {step.description or "Click image"}\n{indent}location = pyautogui.locateOnScreen("{step.target}")\n{indent}if location:\n{indent}    pyautogui.click(location)\n\n'
            else:
                return f'{indent}# Step {index + 1}: {step.description or "Click"}\n{indent}pyautogui.click()\n\n'
        
        elif step.action == "type":
            return f'{indent}# Step {index + 1}: {step.description or "Type text"}\n{indent}pyautogui.write("{step.value}", interval=0.05)\n\n'
        
        elif step.action == "hotkey":
            keys = step.value.split("+")
            keys_str = ", ".join(f'"{k.strip()}"' for k in keys)
            return f'{indent}# Step {index + 1}: {step.description or "Hotkey"}\n{indent}pyautogui.hotkey({keys_str})\n\n'

        
        elif step.action == "screenshot":
            return f'{indent}# Step {index + 1}: {step.description or "Screenshot"}\n{indent}pyautogui.screenshot("{step.value or "desktop_screenshot.png"}")\n\n'
        
        elif step.action == "move":
            coords = step.target.split(",")
            if len(coords) == 2:
                return f'{indent}# Step {index + 1}: {step.description or "Move mouse"}\n{indent}pyautogui.moveTo({coords[0]}, {coords[1]})\n\n'
        
        elif step.action == "wait":
            return f'{indent}# Step {index + 1}: {step.description or "Wait"}\n{indent}time.sleep({step.value or 1})\n\n'
        
        return f'{indent}# Step {index + 1}: Unknown action "{step.action}"\n{indent}pass\n\n'

    async def record_browser_workflow(
        self,
        start_url: str,
        max_steps: int = 10,
    ) -> list[BrowserStep]:
        """
        Record a browser workflow interactively.
        
        Note: This requires a headed browser and user interaction.
        """
        # Placeholder - actual recording would require headed mode
        return [
            BrowserStep(action="goto", value=start_url, description="Navigate to page"),
        ]

    async def analyze_page_structure(self, url: str) -> dict[str, Any]:
        """
        Analyze a page to find interactive elements.
        
        Returns a map of elements suitable for automation.
        """
        try:
            from playwright.async_api import async_playwright
        except ImportError:
            return {"error": "Playwright not installed"}
        
        async with async_playwright() as p:
            browser = await p.chromium.launch(headless=True)
            page = await browser.new_page()
            
            try:
                await page.goto(url, wait_until="networkidle")
                
                # Find interactive elements
                elements = await page.evaluate('''
                    () => {
                        const results = {
                            buttons: [],
                            inputs: [],
                            links: [],
                            forms: []
                        };
                        
                        document.querySelectorAll('button, [role="button"]').forEach((el, i) => {
                            if (i < 20) results.buttons.push({
                                text: el.textContent?.trim().slice(0, 50),
                                selector: el.id ? `#${el.id}` : `button:nth-of-type(${i + 1})`
                            });
                        });
                        
                        document.querySelectorAll('input, textarea').forEach((el, i) => {
                            if (i < 20) results.inputs.push({
                                name: el.name || el.placeholder || `input${i}`,
                                type: el.type,
                                selector: el.id ? `#${el.id}` : `input[name="${el.name}"]`
                            });
                        });
                        
                        document.querySelectorAll('a[href]').forEach((el, i) => {
                            if (i < 20) results.links.push({
                                text: el.textContent?.trim().slice(0, 50),
                                href: el.href,
                                selector: el.id ? `#${el.id}` : `a:nth-of-type(${i + 1})`
                            });
                        });
                        
                        document.querySelectorAll('form').forEach((el, i) => {
                            if (i < 10) results.forms.push({
                                action: el.action,
                                method: el.method,
                                selector: el.id ? `#${el.id}` : `form:nth-of-type(${i + 1})`
                            });
                        });
                        
                        return results;
                    }
                ''')
                
                return elements
                
            finally:
                await browser.close()

    async def close(self):
        """Clean up resources."""
        if self._browser:
            await self._browser.close()
        if self._playwright:
            await self._playwright.stop()
