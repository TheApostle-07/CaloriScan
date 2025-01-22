# 🍴 CaloriesScanner  

**Track Calories, Nutrients, and Minerals Effortlessly with AI!**  

![[CaloriesScanner Web Image](https://imgur.com/a/wa5NPiv)] 


---

## 🌐 Live Demo  

🎉 **Experience CaloriesScanner in action!** Click the link below to explore the live version of our project:  
[🚀 **CaloriesScanner - Live Demo**](https://calori-scan-frontend.vercel.app/)
---

# 👩‍💻 Contributors
### This project was created by:
- **Rufus Bright** (Team Lead)
- **Shivam Kumar Singh**
- **Dubey Arpitkumar Shreesurendranath**
- **Gulshan Nagar**

---

## 📖 About  

**CaloriesScanner** is an innovative web application that scans QR codes of food dishes and analyzes their calorie, nutrient, and mineral content. By integrating powerful technologies such as **Google Vision**, **Object Detection**, and **OpenAI API**, CaloriesScanner provides users with detailed insights into their food choices.  

---

## ✨ Features  

- **QR Code Scanning**: Instantly retrieve dish details by scanning QR codes.  
- **Google Vision Integration**: Uses Google Vision API to detect and extract text and images from food labels and QR codes, ensuring accurate data retrieval.  
- **Object Detection**: Identifies key ingredients in a dish and provides a breakdown of their nutritional content, all using advanced image processing and object recognition techniques.  
- **OpenAI API**: Provides detailed insights about food items, such as nutrients, benefits, and possible allergens.  
- **Dynamic Updates**: Modify ingredient quantities to recalculate calorie, protein, fat, and carb values in real-time.  
- **Inventory Management**: Add, update, and delete dishes and ingredients using a simple CRUD interface.  

---

## 🛠️ Tech Stack  

- **Frontend**: React.js, Chart.js, Bootstrap  
- **Backend**: Node.js, Express.js, MongoDB  
- **APIs**:  
  - Google Vision API for text and image recognition  
  - OpenAI API for detailed food analysis and insights  
  - Object Detection for ingredient identification  


---

## 🚀 Getting Started  

### 1️⃣ Clone the Repository  
```bash  
git clone [https://github.com/TheApostle-07/CaloriScan.git]
cd CaloriScan

### 2️⃣ Install Dependencies

#### For the Backend:
1. Navigate to the backend directory:
   ```bash
   cd server
2. Install the required dependencies:
   ```bash
   npm install

#### For the Frontend:
1.	Navigate to the frontend directory:
   ```bash
   cd client
2.	Install the required dependencies:
   ```bash
   npm install --legacy-peer-deps

### 3️⃣ Set Up Environment Variables

#### Backend Environment Variables
Create a `.env` file in the `backend` directory and add the following keys:

```plaintext
PORT=5000
MONGO_URI=your_mongodb_connection_string
GOOGLE_API_KEY=your_google_vision_api_key
OPENAI_API_KEY=your_openai_api_key

Replace the placeholders (your_mongodb_connection_string, your_google_vision_api_key, your_openai_api_key) with your actual credentials.
