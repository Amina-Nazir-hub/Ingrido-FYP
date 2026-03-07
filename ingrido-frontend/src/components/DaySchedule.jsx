import React from 'react';
import MealCard from './MealCard';
import { Card } from "../userinterface/Card"; // Card import karein

export function DaySchedule({ dayData }) {
  return (
    // Poora din ek Card ke andar
    <Card className="mb-8 overflow-hidden shadow-md border-border/40">
      <div className="bg-primary px-6 py-3">
        <h2 className="text-white font-bold text-lg">{dayData.day}</h2>
      </div>
      
      <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-border/50">
        {dayData.meals.map((meal, idx) => (
          <MealCard key={idx} meal={meal} />
        ))}
      </div>
    </Card>
  );
}