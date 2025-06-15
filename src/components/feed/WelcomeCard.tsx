
import React from "react";
import { Profile } from "./types/feedTypes";

const WelcomeCard = ({ profile }: { profile: Profile }) => (
  <div className="bg-gradient-to-r from-blue-800 via-purple-800 to-indigo-900 rounded-lg px-6 py-8 shadow-lg text-center">
    <h2 className="font-bold text-2xl text-white mb-2">👋 Welcome, {profile.name || 'New user'}!</h2>
    <p className="text-purple-200">Upload your first photo or video to be featured in the feed.</p>
    <p className="text-sm text-gray-400 mt-3">We can't wait to see your first post.</p>
  </div>
);

export default WelcomeCard;
