# Image Tagger

A full-stack web application for generating, tagging, and commenting on images with interactive, positional pins. Built with Next.js (Frontend) and Node.js + Express (Backend).

## Features
- **Authentication**: User login and registration system.
- **Image Generation**: Generates randomized seed images using the Picsum API.
- **Interactive Pins**: Click anywhere on the image to drop a comment pin at exact X/Y coordinates.
- **Comment Threads**: Add nested replies to comment pins for a chat-like experience.
- **Conversational UI**: Dynamic chat bubbles with unique username colors.
- **Draggable Pins**: Move your own pins around the image (restricted dynamically to the image bounds).
- **Responsive Design**: Mobile-friendly sidebars and smart popovers that stay on screen.

## Tech Stack
- **Frontend**: React, Next.js (TypeScript), Tailwind CSS, Framer Motion, Lucide React, Axios.
- **Backend**: Node.js, Express, TypeScript, CORS, bcrypt (for mock authentication).

---

## Setup & Installation

### Prerequisites
Ensure you have [Node.js](https://nodejs.org/) (v16 or higher) installed on your machine.

### 1. Backend Setup
Navigate to the backend directory, install the required dependencies, and start the development server.

```bash
cd backend
npm install
npm run dev
```
The backend server will automatically start on **http://localhost:3001**.

### 2. Frontend Setup
Open a **new** terminal window, navigate to the frontend directory, install the dependencies, and start the Next.js development server.

```bash
cd frontend
npm install
npm run dev
```
The frontend application will compile and start on **http://localhost:3000**.

---

## Usage Guide
1. Open your browser and navigate to `http://localhost:3000`.
2. **Sign Up / Log In** to access the dashboard.
3. Click **Generate New Image** to fetch a random image to your workspace.
4. Toggle **Comment Mode** ON to start interacting:
   - **Click** anywhere on the image to drop a new comment pin.
   - **Click** on existing pins to view the chat history and add replies.
   - **Drag** your pins to reposition them (they will automatically snap to the image constraints).
5. Turn Comment Mode OFF for a clean, read-only viewing experience.
6. Here is a link to the sample usage video: https://drive.google.com/file/d/1mP1a2K1ua2ghDtxiBJ10Xkh8PJdlm8yf/view?usp=sharing