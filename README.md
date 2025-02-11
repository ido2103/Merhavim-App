# Merhavim App

Merhavim App is a web-based clinical transcription and analysis tool designed for psychiatric assessments. The application allows users to record patient sessions, transcribe the audio, analyze the transcript using AI, and generate summarized clinical insights. The project consists of a React-based frontend and an Express-based backend server that handles configuration and settings management.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Features](#features)
3. [Installation](#installation)
4. [Usage](#usage)
5. [Project Structure](#project-structure)
6. [Backend Server](#backend-server)
7. [Frontend Application](#frontend-application)
8. [Configuration](#configuration)
9. [Customization and Modification](#customization-and-modification)
10. [Deployment](#deployment)
11. [Dependencies](#dependencies)
12. [License](#license)

---

## Introduction

Merhavim App is designed to assist clinicians—specifically psychiatrists—in handling patient recordings and generating cohesive clinical summaries. The application guides users through a multi-step wizard providing a structured workflow for:
- Patient data entry
- Recordings, transcriptions, and file management
- AI analysis to extract and highlight clinical insights

The system leverages several tools including AWS Cloudscape Design Components, pdf.js for PDF processing, and AI APIs for transcription and summarization.

---

## Features

- **Multi-Step Wizard:** A guided process for entering patient details, managing recordings, and obtaining insights.
- **Audio Recording and Upload:** Record sessions directly within the app, with support for both audio (mp3/MP4) and video formats.
- **Transcription and Analysis:** Automatic transcription of recordings with options for manual editing and deletion. AI-driven analysis provides clinical insights.
- **PDF to Image Conversion:** Converts PDF documents to images using pdf.js.
- **Backend Configuration Management:** Settings are stored in a JSON file (`server/settings.json`) and are modifiable via dedicated endpoints.
- **Modular Components:** Easily extensible React components and services allow for customization and future development.

---

## Installation

### Prerequisites

- Node.js (v14+ is recommended)
- NPM (comes with Node.js) or Yarn

### Steps

1. **Clone the Repository:**
   ```bash
   git clone <repository_url>
   cd merhavim-app
   ```

2. **Install Dependencies:**
   ```bash
   npm install
   ```
   or if you use Yarn:
   ```bash
   yarn install
   ```

3. **Configure Environment Variables:**

   Create a `.env` file in the project root if you need to specify environment variables. For example, define your API key for AWS services:
   ```env
   REACT_APP_API_KEY=your-api-key-here
   ```

4. **Run the Application:**

   The project uses `concurrently` to start both the frontend (React) and the backend server.
   ```bash
   npm start
   ```
   - The React app will start on [http://localhost:3000](http://localhost:3000).
   - The backend settings server (Express) will run on [http://localhost:3001](http://localhost:3001).

---

## Usage

### For Clinicians

1. **Patient Registration:**  
   - Enter the patient details on the first step (Step1 of the wizard).
   - The system verifies if the patient's identification number is in the allowed list (configured in `server/settings.json`).

2. **Recording and Transcription:**  
   - Use the recording interface to record a new session or upload an existing recording.
   - The recording is processed and transcribed. You can also view existing transcripts.
   - Edit or delete transcripts as needed.

3. **AI Analysis:**  
   - In Step3, the transcript is analyzed using AI according to predefined system instructions and prompts (sourced from `server/settings.json`).
   - The analysis (clinical insights) is displayed in a text area and can be downloaded as a Word document.

### For Developers and Future Users

- **Modifying Transcription and Analysis Rules:**  
  The AI prompts, system instructions, and maximum token limits are stored in `server/settings.json`. These values dictate how the AI summarizes transcripts and should be adjusted according to clinical requirements.

- **Backend Endpoints:**  
  - `GET /settings`  
    Retrieves current settings.
  - `POST /update-settings`  
    Updates settings (e.g., appending a new allowed patient ID).
  - `POST /delete-patient`  
    Removes a patient ID from the list.

- **Extending the Wizard:**  
  The wizard flow is defined within `src/wizard/WizardContainer.js` which is composed of:
  - **Step1:** Patient details and media registration.
  - **Step2:** (In the codebase but not detailed in this README) Handles transcription input and interaction.
  - **Step3:** AI analysis and summary display.

---

## Project Structure

Below is an overview of the main directories and files in the codebase:

- **/server**
  - `settings.json` – Holds system-wide settings and configuration (e.g., allowed patient IDs, system instructions, prompts).
  - `settingsServer.js` – Express server responsible for serving and updating the configuration.

- **/src**
  - **/components**
    - `RecordingControls.js` – Manages recording UI and interactions.
    - `TranscriptionSection.js` – Handles transcription UI, selection, saving, and deleting of transcripts.
    - `pdfHelper.js` – Provides functions to convert PDF pages to images.
  - **/services**
    - `transcriptionService.js` – Interacts with external transcription APIs and handles file uploads.
  - **/wizard**
    - `Step1.js` – Patient details and recording step.
    - `Step2.js` – Transcription and file management step.
    - `Step3.js` – AI analysis and final summary step.
    - `WizardContainer.js` – Manages the multi-step wizard workflow.
  - `config.js` – Contains configuration details (e.g., backend API URL).

- **Root Files**
  - `package.json` – Contains dependencies and scripts.
  - `.gitignore` – Files and folders to be ignored by git.
  - `README.md` – Project documentation (this file).

---

## Backend Server

The backend is built on Express and provides endpoints to read and update the application's configuration. Key aspects include:

- **CORS Enabled:** Ensures that requests from the frontend are permitted.
- **File-Based Settings:** Settings are managed via a JSON file (`settings.json`), and endpoints include:
  - `/settings`: GET endpoint to fetch current settings.
  - `/update-settings`: POST endpoint to add new allowed patient numbers.
  - `/delete-patient`: POST endpoint to remove patient IDs.

The backend runs on `http://localhost:3001`.

---

## Frontend Application

The frontend is a React application bootstrapped with Create React App and makes extensive use of AWS Cloudscape Design Components for a modern UI. Important points include:

- **Wizard Flow:**  
  The wizard (in `WizardContainer.js`) guides users through patient information, recording uploads/transcriptions, and AI analysis.
  
- **Recording & Transcription:**  
  Components like `RecordingControls.js` and `TranscriptionSection.js` handle the core functionality:
  - Recording management (start, stop, pause, delete).
  - Transcription initiation and editing.
  - Fetching and displaying available recordings and transcripts.

- **PDF Processing:**  
  The helper in `pdfHelper.js` uses pdf.js to convert PDF pages into images when needed.

- **Configuration:**  
  Frontend configuration (e.g., API URL) is maintained in `src/config.js`.

---

## Configuration

- **settings.json (Backend):**  
  Modify the file to update:
  - `allowedNumbers`: A list of authorized patient numbers.
  - `system_instructions`, `prompt`, `transcription_system_instructions`, `transcription_prompt`, `summary_system_instructions`, `summary_prompt`: These fields define the AI behavior and summarization logic.

- **Environment Variables:**  
  Set the `REACT_APP_API_KEY` in your .env file to configure access to external APIs.

- **src/config.js:**  
  This file points to the backend API and should be updated if the API URL changes.
  
---

## Customization and Modification

### Adding or Modifying Functionality

- **New Wizard Steps:**  
  To add or modify steps of the wizard, update `src/wizard/WizardContainer.js`. The modular design using separate components (e.g., Step1, Step2, Step3) allows you to plug in additional steps with minimal hassle.

- **Updating AI Prompts:**  
  Adjust the values in `server/settings.json` to modify the instructions and prompts sent to the external AI transcription or summarization services.

- **Modifying Recording Behavior:**  
  Editing `src/components/RecordingControls.js` allows you to change how recordings are managed, previewed, and uploaded.

### Debugging and Extending
- **Logging:**  
  The codebase includes console logs in key functions (e.g., file uploads, API responses) to help with debugging.
- **Error Handling:**  
  Each asynchronous operation (e.g., fetching transcripts, uploading files) has error handling to alert the user and log error messages (using StatusIndicator components).

---

## Deployment

### Production Build

1. **Build the Frontend:**
   ```bash
   npm run build
   ```
   This command creates a production-ready build in the `/build` folder.

2. **Running the Backend in Production:**
   You may use a process manager like PM2 (already included in dependencies) to run the backend server:
   ```bash
   pm2 start server/settingsServer.js --name "merhavim-settings-server"
   ```

3. **Serving the Frontend:**
   The build files in `/build` should be served using a static server of your choice (e.g., Nginx, serve).

---

## Dependencies

- **Frontend:**
  - React, React-DOM, react-scripts
  - @cloudscape-design/components & @cloudscape-design/global-styles
  - pdfjs-dist (for PDF conversion)
  - docx, file-saver, jspdf for document generation

- **Backend:**
  - Express for server routing
  - Cors for handling cross-origin requests
  - Node.js built-in `fs` and `path` modules for file operations

- **Development Tools:**
  - concurrently (to run multiple processes)
  - PM2 (for production process management)

---

## License

This project is open-source. See the [LICENSE](LICENSE) file for details.

---

Happy coding! If you have any questions or need further customization, feel free to open an issue or contact the maintainers.
"# Merhavim-App" 
