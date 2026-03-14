import React, { useState, useEffect } from 'react';
import { collection, query, where, orderBy, onSnapshot, updateDoc, doc, writeBatch } from 'firebase/firestore';
import { db } from '../firebase';
import { useAuth } from '../App';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, Check, Trash2, Clock, AlertCircle, Info, CheckCircle2, Zap } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

export default function Notifications() {
  const { profile } = useAuth();
  const [notifications, setNotifications] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!profile) return;

    const q = query(
      collection(db, 'notifications'),
      where('userId', '==', profile.uid),
      orderBy('createdAt', 'desc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      setNotifications(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      setLoading(false);
    });

    return () => unsubscribe();
  }, [profile]);

  const markAsRead = async (id: string) => {
    try {
      await updateDoc(doc(db, 'notifications', id), { read: true });
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const markAllAsRead = async () => {
    const batch = writeBatch(db);
    notifications.filter(n => !n.read).forEach(n => {
      batch.update(doc(db, 'notifications', n.id), { read: true });
    });
    await batch.commit();
  };

  const deleteNotification = async (id: string) => {
    // In a real app, you might delete or archive
    // For now, let's just mark as read if we don't want to delete
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'payment': return <Zap className="w-5 h-5 text-emerald-400" />;
      case 'milestone': return <CheckCircle2 className="w-5 h-5 text-blue-400" />;
      case 'alert': return <AlertCircle className="w-5 h-5 text-red-400" />;
      default: return <Info className="w-5 h-5 text-zinc-400" />;
    }
  };

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <div className="flex items-center justify-between mb-12">
        <div>
          <h1 className="text-4xl font-display font-bold mb-2">Notifications</h1>
          <p className="text-zinc-500">Stay updated with your project activities and AI agent alerts.</p>
        </div>
        {notifications.some(n => !n.read) && (
          <button 
            onClick={markAllAsRead}
            className="flex items-center gap-2 px-4 py-2 bg-white/5 hover:bg-white/10 rounded-xl text-xs font-bold transition-all border border-white/10"
          >
            <Check className="w-4 h-4" />
            Mark all as read
          </button>
        )}
      </div>

      {loading ? (
        <div className="flex justify-center py-20">
          <div className="w-8 h-8 border-4 border-emerald-500/30 border-t-emerald-500 animate-spin rounded-full" />
        </div>
      ) : notifications.length === 0 ? (
        <div className="text-center py-20 bg-zinc-900/30 border border-dashed border-white/5 rounded-[40px]">
          <Bell className="w-12 h-12 text-zinc-700 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-zinc-500">No notifications yet</h3>
          <p className="text-zinc-600 text-sm">We'll notify you when something important happens.</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="popLayout">
            {notifications.map((notif, idx) => (
              <motion.div
                key={notif.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ delay: idx * 0.05 }}
                className={`p-6 rounded-[32px] border transition-all flex items-start gap-4 group ${
                  notif.read 
                    ? 'bg-zinc-900/30 border-white/5 opacity-60' 
                    : 'bg-zinc-900/80 border-emerald-500/20 shadow-lg shadow-emerald-500/5'
                }`}
              >
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 ${
                  notif.read ? 'bg-white/5' : 'bg-emerald-500/10'
                }`}>
                  {getIcon(notif.type)}
                </div>
                
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h4 className={`font-bold truncate ${notif.read ? 'text-zinc-400' : 'text-white'}`}>
                      {notif.title}
                    </h4>
                    <span className="text-[10px] font-medium text-zinc-500 flex items-center gap-1 shrink-0">
                      <Clock className="w-3 h-3" />
                      {formatDistanceToNow(new Date(notif.createdAt))} ago
                    </span>
                  </div>
                  <p className={`text-sm leading-relaxed mb-4 ${notif.read ? 'text-zinc-500' : 'text-zinc-400'}`}>
                    {notif.message}
                  </p>
                  
                  {!notif.read && (
                    <button 
                      onClick={() => markAsRead(notif.id)}
                      className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest hover:text-emerald-400 transition-colors"
                    >
                      Mark as read
                    </button>
                  )}
                </div>
              </motion.div>
            ))}
          </AnimatePresence>
        </div>
      )}
    </div>
  );
}
