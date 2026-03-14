import React, { useState, useEffect } from 'react';
import { useAuth } from '../App';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { motion } from 'motion/react';
import {
  Settings as SettingsIcon,
  Bell,
  Shield,
  Eye,
  Lock,
  Globe,
  Moon,
  Smartphone,
  ChevronRight,
  Zap,
  Save,
  CheckCircle2,
  AlertCircle,
  Download,
  Upload,
  BarChart3,
  Users,
  Clock,
  Mail,
  MessageSquare,
  Star,
  FileText,
  Palette
} from 'lucide-react';

interface UserSettings {
  language: string;
  darkMode: boolean;
  aiAssistanceLevel: string;
  twoFactorEnabled: boolean;
  privacyMode: string;
  pushNotifications: boolean;
  smsAlerts: boolean;
  emailNotifications: boolean;
  projectReminders: boolean;
  milestoneDeadlines: boolean;
  theme: string;
  autoSave: boolean;
  dataExport: boolean;
}

export default function Settings() {
  const { profile, user } = useAuth();
  const [settings, setSettings] = useState<UserSettings>({
    language: 'en',
    darkMode: false,
    aiAssistanceLevel: 'medium',
    twoFactorEnabled: false,
    privacyMode: 'standard',
    pushNotifications: true,
    smsAlerts: false,
    emailNotifications: true,
    projectReminders: true,
    milestoneDeadlines: true,
    theme: 'dark',
    autoSave: true,
    dataExport: false
  });
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'success' | 'error'>('idle');

  useEffect(() => {
    if (user) {
      loadSettings();
    }
  }, [user]);

  const loadSettings = async () => {
    if (!user) return;
    try {
      const settingsRef = doc(db, 'userSettings', user.uid);
      const settingsSnap = await getDoc(settingsRef);
      if (settingsSnap.exists()) {
        setSettings(settingsSnap.data() as UserSettings);
      }
    } catch (error) {
      console.error('Error loading settings:', error);
    }
  };

  const saveSettings = async () => {
    if (!user) return;
    setIsSaving(true);
    setSaveStatus('idle');
    try {
      const settingsRef = doc(db, 'userSettings', user.uid);
      await updateDoc(settingsRef, settings);
      setSaveStatus('success');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } catch (error) {
      console.error('Error saving settings:', error);
      setSaveStatus('error');
      setTimeout(() => setSaveStatus('idle'), 3000);
    } finally {
      setIsSaving(false);
    }
  };

  const updateSetting = (key: keyof UserSettings, value: any) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  return (
    <div className="min-h-screen bg-[#050505] font-sans py-16 px-6 text-white">
      <div className="max-w-4xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-10"
        >
          <h1 className="text-4xl font-display font-bold tracking-tight mb-4 flex items-center gap-4">
            <SettingsIcon className="text-emerald-400 w-10 h-10" />
            System Configuration
          </h1>
          <p className="text-zinc-400 text-lg">
            Customize your TrustBridge experience and security preferences.
          </p>
        </motion.div>

        <div className="space-y-8">
          {/* Account & Security */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-[#0A0A0A] rounded-[48px] border border-white/5 shadow-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-br from-zinc-900 to-black p-8 border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-emerald-500/20">
                  <Shield className="text-emerald-400 w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">Account & Security</h2>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">
                    Language
                  </label>
                  <select
                    value={settings.language}
                    onChange={(e) => updateSetting('language', e.target.value)}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none text-white"
                  >
                    <option value="en">English</option>
                    <option value="es">Español</option>
                    <option value="fr">Français</option>
                    <option value="de">Deutsch</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">
                    Privacy Mode
                  </label>
                  <select
                    value={settings.privacyMode}
                    onChange={(e) => updateSetting('privacyMode', e.target.value)}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none text-white"
                  >
                    <option value="standard">Standard</option>
                    <option value="enhanced">Enhanced</option>
                    <option value="maximum">Maximum</option>
                  </select>
                </div>
              </div>

              <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-4">
                  <Lock className="text-emerald-400 w-5 h-5" />
                  <div>
                    <h3 className="font-bold text-white">Two-Factor Authentication</h3>
                    <p className="text-zinc-400 text-sm">Add an extra layer of security to your account</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.twoFactorEnabled}
                    onChange={(e) => updateSetting('twoFactorEnabled', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>
          </motion.div>

          {/* AI & Assistance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="bg-[#0A0A0A] rounded-[48px] border border-white/5 shadow-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-br from-zinc-900 to-black p-8 border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-emerald-500/20">
                  <Zap className="text-emerald-400 w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">AI & Assistance</h2>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div>
                <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">
                  AI Assistance Level
                </label>
                <select
                  value={settings.aiAssistanceLevel}
                  onChange={(e) => updateSetting('aiAssistanceLevel', e.target.value)}
                  className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none text-white"
                >
                  <option value="low">Low - Manual control</option>
                  <option value="medium">Medium - Balanced assistance</option>
                  <option value="high">High - Full automation</option>
                </select>
              </div>

              <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-4">
                  <Save className="text-emerald-400 w-5 h-5" />
                  <div>
                    <h3 className="font-bold text-white">Auto-Save Projects</h3>
                    <p className="text-zinc-400 text-sm">Automatically save project changes</p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={settings.autoSave}
                    onChange={(e) => updateSetting('autoSave', e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                </label>
              </div>
            </div>
          </motion.div>

          {/* Notifications */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="bg-[#0A0A0A] rounded-[48px] border border-white/5 shadow-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-br from-zinc-900 to-black p-8 border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-emerald-500/20">
                  <Bell className="text-emerald-400 w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">Notifications</h2>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <Smartphone className="text-emerald-400 w-4 h-4" />
                    <span className="font-medium">Push Notifications</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.pushNotifications}
                      onChange={(e) => updateSetting('pushNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <Mail className="text-emerald-400 w-4 h-4" />
                    <span className="font-medium">Email Notifications</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.emailNotifications}
                      onChange={(e) => updateSetting('emailNotifications', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <MessageSquare className="text-emerald-400 w-4 h-4" />
                    <span className="font-medium">SMS Alerts</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.smsAlerts}
                      onChange={(e) => updateSetting('smsAlerts', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>

                <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-3">
                    <Clock className="text-emerald-400 w-4 h-4" />
                    <span className="font-medium">Project Reminders</span>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.projectReminders}
                      onChange={(e) => updateSetting('projectReminders', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Appearance */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="bg-[#0A0A0A] rounded-[48px] border border-white/5 shadow-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-br from-zinc-900 to-black p-8 border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-emerald-500/20">
                  <Palette className="text-emerald-400 w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">Appearance</h2>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-[10px] font-bold text-zinc-500 uppercase tracking-[0.2em] mb-4">
                    Theme
                  </label>
                  <select
                    value={settings.theme}
                    onChange={(e) => updateSetting('theme', e.target.value)}
                    className="w-full px-6 py-4 bg-white/5 border border-white/10 rounded-2xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500/50 outline-none text-white"
                  >
                    <option value="dark">Dark</option>
                    <option value="light">Light</option>
                    <option value="auto">Auto</option>
                  </select>
                </div>

                <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/10">
                  <div className="flex items-center gap-4">
                    <Moon className="text-emerald-400 w-5 h-5" />
                    <div>
                      <h3 className="font-bold text-white">Dark Mode</h3>
                      <p className="text-zinc-400 text-sm">Toggle dark theme</p>
                    </div>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={settings.darkMode}
                      onChange={(e) => updateSetting('darkMode', e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-emerald-500/20 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-500"></div>
                  </label>
                </div>
              </div>
            </div>
          </motion.div>

          {/* Data & Privacy */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="bg-[#0A0A0A] rounded-[48px] border border-white/5 shadow-2xl overflow-hidden"
          >
            <div className="bg-gradient-to-br from-zinc-900 to-black p-8 border-b border-white/5">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-emerald-500/10 backdrop-blur-md rounded-2xl flex items-center justify-center border border-emerald-500/20">
                  <Download className="text-emerald-400 w-6 h-6" />
                </div>
                <h2 className="text-2xl font-bold">Data & Privacy</h2>
              </div>
            </div>

            <div className="p-8 space-y-6">
              <div className="flex items-center justify-between p-6 bg-white/5 rounded-2xl border border-white/10">
                <div className="flex items-center gap-4">
                  <FileText className="text-emerald-400 w-5 h-5" />
                  <div>
                    <h3 className="font-bold text-white">Data Export</h3>
                    <p className="text-zinc-400 text-sm">Download your data</p>
                  </div>
                </div>
                <button className="px-6 py-3 bg-emerald-500 text-black rounded-2xl font-bold hover:bg-emerald-400 transition-all">
                  Export Data
                </button>
              </div>

              <div className="pt-6 border-t border-white/5">
                <button className="w-full py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 font-bold rounded-2xl transition-all border border-red-500/20">
                  Deactivate Account
                </button>
              </div>
            </div>
          </motion.div>

          {/* Save Button */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.6 }}
            className="flex justify-center pt-8"
          >
            <button
              onClick={saveSettings}
              disabled={isSaving}
              className="px-12 py-5 bg-emerald-500 text-black rounded-[32px] font-bold hover:bg-emerald-400 transition-all flex items-center justify-center gap-3 shadow-2xl shadow-emerald-500/20 disabled:opacity-50 text-lg"
            >
              {isSaving ? (
                <div className="w-6 h-6 border-2 border-black border-t-transparent rounded-full animate-spin" />
              ) : saveStatus === 'success' ? (
                <CheckCircle2 className="w-6 h-6" />
              ) : saveStatus === 'error' ? (
                <AlertCircle className="w-6 h-6" />
              ) : (
                <Save className="w-6 h-6" />
              )}
              {isSaving ? 'Saving...' : saveStatus === 'success' ? 'Settings Saved!' : saveStatus === 'error' ? 'Save Failed' : 'Save Settings'}
            </button>
          </motion.div>
        </div>
      </div>
    </div>
  );
}
