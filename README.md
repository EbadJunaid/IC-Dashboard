# Internet Computer Dashboard Clone

A pixel-perfect clone of the [Internet Computer (ICP) Dashboard](https://dashboard.internetcomputer.org) homepage. This project replicates the UI/UX, responsiveness, and design system of the original site, featuring **real-time data** powered by official ICP APIs.

https://github.com/user-attachments/assets/ae6e86e7-5cf3-45cc-a3d1-93c880d38309


<br>

## ⚡ Real-Time Data Integration

This dashboard is not just a static UI. It fetches live blockchain data using the official **Internet Computer Dashboard APIs**:
* **Source:** [ICP Dashboard API Reference](https://docs.internetcomputer.org/references/dashboard-apis)
* **Implementation:** Fetches real-time stats for blocks, transactions, and network status directly from the IC network.

<br>

## 🛠 Tech Stack

- **Framework:** [Next.js 15](https://nextjs.org/) (App Router)
- **Core:** [React 19](https://react.dev/) & [TypeScript](https://www.typescriptlang.org/)
- **Styling:** [Tailwind CSS 4](https://tailwindcss.com/) & [Tailwind Animate](https://github.com/jamiebuilds/tailwindcss-animate)
- **Visualization:** [Recharts](https://recharts.org/) (Charts) & [Three.js / Fiber](https://docs.pmnd.rs/react-three-fiber) (3D Elements)
- **Icons:** [Lucide React](https://lucide.dev/)

<br>

## 🚀 Getting Started

Follow these steps to run the project locally.

### Prerequisites
Ensure you have **Node.js 18+** installed.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/EbadJunaid/IC-Dashboard/
   cd ic-dashboard
2. Install dependencies
    ```bash 
    npm install
3. Start the development server
    ```bash 
    npm run dev
4.  Open your browser Navigate to http://localhost:3000

<br>

### 📂 Project Structure

``` bash 
.
├── public/                  
├── src
│   ├── app/                 
│   ├── components/
│   │   ├── ui/              
│   │   ├── EarthComponent   
│   │   ├── StatsPanel       
│   │   ├── MetricCard       
│   │   ├── CycleBurnRate    
│   │   └── ...              
│   ├── hooks/               
│   ├── lib/                 
│   └── types/               
├── next.config.ts           
├── tailwind.config.js       
└── package.json   
```          


### 📄 License
Distributed under the MIT License.
