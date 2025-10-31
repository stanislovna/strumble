"use client";

import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

const labels = [
  "Helpfulness",
  "Safety",
  "Openness",
  "Trad/Modern",
  "Pace",
  "Indiv/Comm",
  "Hospitality",
  "Equality",
  "Religion",
  "Trust",
];

export default function PollChart({
  locals = [4, 5, 4, 3, 4, 5, 4, 3, 2, 4],
  travelers = [5, 4, 5, 4, 4, 4, 5, 4, 3, 4],
}: {
  locals?: number[];
  travelers?: number[];
}) {
  const data = {
    labels,
    datasets: [
      {
        label: "Locals",
        data: locals,
        backgroundColor: "rgba(255,255,255,0.7)",
        borderColor: "rgba(255,255,255,0.9)",
        borderWidth: 1,
        borderRadius: 6,
      },
      {
        label: "Travelers",
        data: travelers,
        backgroundColor: "rgba(255,255,255,0.35)",
        borderColor: "rgba(255,255,255,0.55)",
        borderWidth: 1,
        borderRadius: 6,
      },
    ],
  };

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    scales: {
      x: {
        ticks: { color: "#e7eceb", maxRotation: 35, minRotation: 35 },
        grid: { color: "rgba(231,236,235,0.08)", drawBorder: false },
      },
      y: {
        beginAtZero: true,
        ticks: { color: "#e7eceb", stepSize: 1 },
        grid: { color: "rgba(231,236,235,0.08)", drawBorder: false },
      },
    },
    plugins: {
      legend: { labels: { color: "#e7eceb" } },
      tooltip: { enabled: true },
    },
    animation: { duration: 250 },
  } as const;

  // ключ заставляет точно перерисовать график после submit
  const rerenderKey = JSON.stringify({ locals, travelers });

  return (
    <div className="h-64" key={rerenderKey}>
      <Bar data={data} options={options} />
    </div>
  );
}
