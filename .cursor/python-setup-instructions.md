# Python Environment Setup Instructions for CuraAI

## Prerequisites
- pyenv installed on macOS
- Python 3.13.5 available via pyenv

## Step-by-step Setup

### 1. Verify Python 3.13.5 is installed
```bash
pyenv versions | grep 3.13.5
```

### 2. Set Python 3.13.5 as local version for the project
```bash
cd /Users/nathalia/Personal/work/open-source-contributions/CuraAI
pyenv local 3.13.5
```

### 3. Create a new virtual environment with Python 3.13.5
```bash
pyenv virtualenv 3.13.5 cura-ai-final
```

### 4. Activate the virtual environment
```bash
pyenv activate cura-ai-final
```

### 5. Verify the environment is using Python 3.13.5
```bash
python --version
which python
```
Expected output:
```
Python 3.13.5
/Users/nathalia/.pyenv/versions/3.13.5/envs/cura-ai-final/bin/python
```

### 6. Install Python dependencies
```bash
pip install -r requirements.txt
```

**Note:** The requirements.txt file has `pywin32==311` commented out (line 37) since it's Windows-specific and not needed on macOS.

### 7. Test the AI agent
```bash
python ai/api.py
```

## Troubleshooting

### If pyenv is not using the correct Python version:
1. Restart your shell: `exec $SHELL`
2. Verify pyenv is in your PATH
3. Check if `.python-version` file exists in the project directory

### If dependencies fail to install:
1. Ensure you're in the correct virtual environment
2. Update pip: `pip install --upgrade pip`
3. Install dependencies individually if needed

### Common Dependencies for Manual Installation:
```bash
pip install fastapi uvicorn openai python-dotenv speechrecognition pygame requests pydub pyaudio av keyboard openai-agents jinja2
```

## Project Structure
- **AI Agent**: `ai/api.py` - FastAPI server with WebSocket support
- **Smart Contracts**: `fhevm-contracts/` - Zama FHEVM contracts
- **Frontend**: Next.js application with Privy authentication

## Next Steps
Once dependencies are installed:
1. Start the AI agent: `python ai/api.py`
2. Start the frontend: `npm run dev`
3. Deploy smart contracts: `cd fhevm-contracts && npm run deploy:localhost`
