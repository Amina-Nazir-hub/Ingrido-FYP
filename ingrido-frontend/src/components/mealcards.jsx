import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "../userinterface/Card";
import { Badge } from "../userinterface/Badge";
import { Clock } from "lucide-react";

function MealCard({ meal }) {
  return (
    // Dekhiye, yahan humne 'div' ki jagah 'Card' use kiya hai
    <Card className="h-full border-none shadow-none hover:bg-muted/50 transition-all">
      <CardHeader className="p-4 pb-2">
        <div className="flex justify-between items-center mb-2">
          <Badge variant={meal.variant}>{meal.type}</Badge>
          <div className="flex items-center text-[10px] text-muted-foreground">
            <Clock className="h-3 w-3 mr-1" /> 25 min
          </div>
        </div>
        <CardTitle className="text-lg font-bold">{meal.title}</CardTitle>
      </CardHeader>
      
      <CardContent className="p-4 pt-0">
        <p className="text-sm text-muted-foreground line-clamp-2">
          {meal.desc}
        </p>
        <button className="mt-4 text-xs font-bold text-primary uppercase tracking-wider">
          View Recipe
        </button>
      </CardContent>
    </Card>
  );
}

export default MealCard;