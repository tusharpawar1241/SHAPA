# 🛡️ SHAPA: AI Product Safety Assistant

SHAPA (Smart Health & Product Analyzer) is an intelligent, personalized product safety checker powered by the Google Gemini API. It empowers users to analyze Food, Medicine, and Cosmetics by cross-referencing ingredients and nutritional facts against their specific health profile, allergies, and personal goals.

## ✨ Core Modules

* **🍎 Food Guardian**: Analyzes nutritional facts and ingredients to check for high sugar/fat/sodium content, allergens (like gluten or dairy), and evaluates if the product is friendly for weight loss or diabetes management.
* **💊 Meds Guardian**: Provides critical safety checks for medications including drug-drug interactions, pregnancy/kidney disease contraindications, allergy risks, and common side effects.
* **🧪 Cosmetic Guardian**: Scans skincare and cosmetic products for harmful chemicals (e.g. parabens, sulfates) and verifies compatibility for sensitive skin or specific concerns like acne.

## 🚀 Key Features

* **📷 AI Vision Scanning**: Instantly analyze physical product labels by uploading an image or scanning it directly with your device's camera.
* **🔍 Smart Text Search**: Query products by name, barcode, or keywords.
* **👤 Deep Personalization**: Create a rich user profile detailing age, gender, medical conditions (hypertension, kidney disease), dietary goals, and skin concerns for highly tailored safety warnings.
* **⚡ Google Gemini Powered**: Leverages `gemini-1.5-flash` for high-speed, highly accurate OCR extraction and intelligent reasoning over complex clinical and nutritional data.
* **🔄 Local Simulator Mode**: A robust fallback system with an interactive rules engine to test logic and see mock results without consuming API credits.

## 🛠️ Tech Stack

* **Frontend**: React 18, Vite
* **Styling**: Tailwind CSS, Google Material Symbols
* **AI Model**: Google Gemini API (`gemini-1.5-flash`)
* **State Management**: React Hooks & Local Storage

## 📦 Getting Started

### Prerequisites
* Node.js (v16+)
* A Google AI Studio API Key

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-username/SHAPA.git
   cd SHAPA
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Configure your API Key:**
   Create a `.env.local` file in the root directory of the project and add your Google Gemini API Key:
   ```env
   VITE_GEMINI_API_KEY=your_gemini_api_key_here
   ```

4. **Start the Development Server:**
   ```bash
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:5173`.

## 🧠 Usage Notes
* **Mock Scans**: Clicking the "Interactive Mock Scans" listed on the right side of the Label Scanner screen executes tests against a local database without hitting the Gemini API. 
* **Live AI Scans**: To actually utilize your API key and perform live analysis, upload an image/take a photo OR use the "Search Product Details" tab to query a specific product!
