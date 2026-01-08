/**
 * Public Profile Viewer
 * Displays public profile of another user
 */

import React, { useState, useEffect } from 'react';
import { dataService } from '../services/dataService.api';
import { UserProfile } from '../types';
import { User, ArrowLeft, Loader } from './Icons.api';

interface PublicProfileViewerProps {
  username: string;
  onBack: () => void;
}

export default function PublicProfileViewer({ username, onBack }: PublicProfileViewerProps) {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [profileData, setProfileData] = useState<{
    user: { username: string; createdAt: string };
    profile: UserProfile;
  } | null>(null);

  useEffect(() => {
    const fetchProfile = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await dataService.getPublicProfile(username);
        if (!data) {
          setError('User not found or profile is private');
        } else {
          setProfileData(data);
        }
      } catch (err: any) {
        setError(err.message || 'Failed to load profile');
      } finally {
        setLoading(false);
      }
    };

    fetchProfile();
  }, [username]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center">
          <Loader size={48} className="animate-spin text-ocean-600 mx-auto mb-4" />
          <p className="text-slate-600">Loading profile...</p>
        </div>
      </div>
    );
  }

  if (error || !profileData) {
    return (
      <div className="flex items-center justify-center h-screen bg-slate-50">
        <div className="text-center max-w-md">
          <div className="w-16 h-16 bg-slate-200 rounded-full flex items-center justify-center mx-auto mb-4">
            <User size={32} className="text-slate-400" />
          </div>
          <h2 className="text-2xl font-bold text-slate-900 mb-2">Profile Not Found</h2>
          <p className="text-slate-600 mb-6">{error || 'This profile is private or does not exist.'}</p>
          <button
            onClick={onBack}
            className="inline-flex items-center gap-2 px-6 py-3 bg-ocean-600 text-white rounded-lg hover:bg-ocean-700 transition-colors"
          >
            <ArrowLeft size={20} />
            Go Back
          </button>
        </div>
      </div>
    );
  }

  const { user, profile } = profileData;
  const memberSince = new Date(user.createdAt).toLocaleDateString('en-US', {
    month: 'short',
    year: 'numeric'
  });

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4">
        <div className="max-w-5xl mx-auto flex items-center justify-between">
          <button
            onClick={onBack}
            className="flex items-center gap-2 text-slate-600 hover:text-slate-900 transition-colors"
          >
            <ArrowLeft size={20} />
            <span className="text-sm font-medium">Back</span>
          </button>
          <div className="text-sm text-slate-500">Public Profile</div>
        </div>
      </header>

      {/* Profile Content */}
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Banner */}
        {profile.bannerUrl && (
          <div className="w-full h-48 rounded-2xl overflow-hidden mb-6 shadow-lg">
            <img
              src={profile.bannerUrl}
              alt="Profile banner"
              className="w-full h-full object-cover"
            />
          </div>
        )}

        {/* Avatar & Info */}
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 mb-6">
          <div className="flex items-start gap-6">
            {profile.avatarUrl ? (
              <img
                src={profile.avatarUrl}
                alt={user.username}
                className="w-24 h-24 rounded-full object-cover shadow-lg border-4 border-white"
              />
            ) : (
              <div className="w-24 h-24 rounded-full bg-ocean-100 flex items-center justify-center shadow-lg border-4 border-white">
                <span className="text-3xl font-bold text-ocean-600">
                  {user.username.charAt(0).toUpperCase()}
                </span>
              </div>
            )}

            <div className="flex-1">
              <h1 className="text-3xl font-bold text-slate-900 mb-2">@{user.username}</h1>
              <p className="text-slate-600 mb-4">Member since {memberSince}</p>

              {/* Stats Row */}
              <div className="flex gap-6">
                <div>
                  <div className="text-2xl font-bold text-ocean-600">{profile.level}</div>
                  <div className="text-sm text-slate-500">Level</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-ocean-600">{profile.xp.toLocaleString()}</div>
                  <div className="text-sm text-slate-500">XP</div>
                </div>
                <div>
                  <div className="text-2xl font-bold text-ocean-600">{profile.unlockedBadges?.length || 0}</div>
                  <div className="text-sm text-slate-500">Badges</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Badges */}
        {profile.unlockedBadges && profile.unlockedBadges.length > 0 && (
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8">
            <h2 className="text-xl font-bold text-slate-900 mb-4">Unlocked Badges</h2>
            <div className="flex flex-wrap gap-3">
              {profile.unlockedBadges.map((badgeId) => (
                <div
                  key={badgeId}
                  className="px-4 py-2 bg-ocean-100 text-ocean-700 rounded-full text-sm font-medium"
                >
                  {badgeId}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
