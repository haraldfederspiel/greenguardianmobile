
import React from 'react';
import { Award, BarChart, Leaf, Trophy } from 'lucide-react';
import SustainabilityScore from '../components/SustainabilityScore';

const achievements = [
  { id: 1, title: 'Eco Explorer', description: 'Analyzed 5 products', icon: Leaf, completed: true },
  { id: 2, title: 'Climate Champion', description: 'Saved 10kg of CO2', icon: Trophy, completed: true },
  { id: 3, title: 'Sustainable Shopper', description: 'Chosen 3 sustainable alternatives', icon: Award, completed: false },
];

const Profile: React.FC = () => {
  const userPoints = 325;
  const sustainabilityScore = 78;
  
  return (
    <div className="animate-fade-in">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Your Profile</h1>
        <p className="text-neutral-500">Track your sustainability journey</p>
      </header>
      
      {/* Profile summary */}
      <div className="glass-card rounded-2xl p-6 mb-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-lg font-bold">Sarah Johnson</h2>
            <p className="text-neutral-500 text-sm">Joined April 2023</p>
          </div>
          <SustainabilityScore score={sustainabilityScore} size="lg" />
        </div>
        
        <div className="flex items-center justify-between bg-neutral-50 rounded-xl p-4">
          <div>
            <p className="text-sm text-neutral-500">Green Points</p>
            <p className="text-2xl font-bold text-green-600">{userPoints}</p>
          </div>
          <div className="bg-white rounded-full p-2 shadow">
            <Leaf size={24} className="text-green-500" />
          </div>
        </div>
      </div>
      
      {/* Impact stats */}
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold">Your Impact</h2>
          <button className="flex items-center text-sm text-green-600">
            <BarChart size={16} className="mr-1" />
            Details
          </button>
        </div>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="glass-card rounded-xl p-4">
            <p className="text-sm text-neutral-500 mb-1">CO2 Saved</p>
            <p className="text-xl font-bold">12.5 kg</p>
          </div>
          <div className="glass-card rounded-xl p-4">
            <p className="text-sm text-neutral-500 mb-1">Water Saved</p>
            <p className="text-xl font-bold">1,240 L</p>
          </div>
          <div className="glass-card rounded-xl p-4">
            <p className="text-sm text-neutral-500 mb-1">Better Choices</p>
            <p className="text-xl font-bold">8</p>
          </div>
          <div className="glass-card rounded-xl p-4">
            <p className="text-sm text-neutral-500 mb-1">Products Analyzed</p>
            <p className="text-xl font-bold">15</p>
          </div>
        </div>
      </div>
      
      {/* Achievements */}
      <div>
        <h2 className="text-lg font-semibold mb-4">Achievements</h2>
        <div className="space-y-3 animate-slide-up" style={{ animationDelay: '0.1s' }}>
          {achievements.map(achievement => (
            <div 
              key={achievement.id} 
              className={`glass-card rounded-xl p-4 flex items-center ${
                achievement.completed ? 'border-l-4 border-green-500' : 'opacity-60'
              }`}
            >
              <div className={`rounded-full p-2 mr-3 ${
                achievement.completed ? 'bg-green-100' : 'bg-neutral-100'
              }`}>
                <achievement.icon 
                  size={20} 
                  className={achievement.completed ? 'text-green-600' : 'text-neutral-400'} 
                />
              </div>
              <div>
                <h3 className="font-medium">{achievement.title}</h3>
                <p className="text-xs text-neutral-500">{achievement.description}</p>
              </div>
              {achievement.completed && (
                <Trophy size={16} className="text-amber-500 ml-auto" />
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Profile;
