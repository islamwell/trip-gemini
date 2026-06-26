import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useLanguage } from '../../contexts/LanguageContext';
import { Link } from 'react-router-dom';
import { ScrollText, Map, MessageSquare, CheckSquare, Bell, Volume2, VolumeX, UserCheck, Pencil } from 'lucide-react';
import { db } from '../../services/firebase';
import { doc, onSnapshot, collection, query, orderBy, limit, setDoc } from 'firebase/firestore';
import { resolveStops, defaultItinerary } from './Itinerary';
import { useToast } from '../../contexts/ToastContext';
import { getDutyTranslationKey } from '../../utils/duty';


interface ParticipantProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  hasSignedRules?: boolean;
  duty?: string;
}

interface NotificationMsg {
  id: string;
  title: string;
  message: string;
  timestamp?: any;
}

export const Dashboard: React.FC = () => {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { showInfo, showSuccess, showError } = useToast();

  const getRoleKey = (dutyDbValue: string | undefined): string => {
    if (!dutyDbValue) return 'none';
    const translationKey = getDutyTranslationKey(dutyDbValue);
    if (!translationKey) return 'none';
    return translationKey.replace('registration.roles.', '');
  };


  // Real-time states
  const [profile, setProfile] = useState<ParticipantProfile | null>(null);
  const [isEditingName, setIsEditingName] = useState(false);
  const [editSalutation, setEditSalutation] = useState('Brother');
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [savingName, setSavingName] = useState(false);

  const parseName = (fullName: string | undefined) => {
    if (!fullName || fullName === 'Participant') {
      return { salutation: 'Brother', firstName: '', lastName: '' };
    }
    const parts = fullName.trim().split(/\s+/);
    if (parts.length === 0) return { salutation: 'Brother', firstName: '', lastName: '' };
    
    let sal = 'Brother';
    let startIdx = 0;
    if (parts[0] === 'Brother' || parts[0] === 'Sister') {
      sal = parts[0];
      startIdx = 1;
    } else {
      sal = '';
      startIdx = 0;
    }
    
    const remaining = parts.slice(startIdx);
    const fName = remaining[0] || '';
    const lName = remaining.slice(1).join(' ');
    
    return { salutation: sal, firstName: fName, lastName: lName };
  };

  const handleOpenEditName = () => {
    const parsed = parseName(profile?.name || user?.displayName || '');
    setEditSalutation(parsed.salutation);
    setEditFirstName(parsed.firstName);
    setEditLastName(parsed.lastName);
    setIsEditingName(true);
  };

  const handleSaveName = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (!editFirstName.trim() || !editLastName.trim()) {
      showError(t('dashboard.name_required', 'First and Last name are required.'));
      return;
    }
    setSavingName(true);
    try {
      const newFullName = `${editSalutation ? editSalutation + ' ' : ''}${editFirstName.trim()} ${editLastName.trim()}`.trim();
      await setDoc(doc(db, 'participants', user.uid), {
        name: newFullName
      }, { merge: true });
      showSuccess(t('dashboard.name_updated', 'Name updated successfully!'));
      setIsEditingName(false);
    } catch (err: any) {
      console.error("Failed to update name:", err);
      showError(err.message || 'Failed to update name. Please try again.');
    } finally {
      setSavingName(false);
    }
  };
  const [allParticipants, setAllParticipants] = useState<ParticipantProfile[]>([]);
  const [dbItinerary, setDbItinerary] = useState<Record<string, any[]>>(defaultItinerary);
  const [latestNotification, setLatestNotification] = useState<NotificationMsg | null>(null);
  const [showNotificationBanner, setShowNotificationBanner] = useState(false);
  const [showDutiesList, setShowDutiesList] = useState(false);

  // Alarm states
  const [audioEnabled, setAudioEnabled] = useState<boolean>(() => {
    return localStorage.getItem('alarm_audio_enabled') !== 'false';
  });
  const [notifEnabled, setNotifEnabled] = useState<boolean>(() => {
    return localStorage.getItem('alarm_notif_enabled') === 'true';
  });
  const [upcomingAlarms, setUpcomingAlarms] = useState<any[]>([]);
  const triggeredAlarmsRef = useRef<Set<string>>(new Set());
  const activeAudioRef = useRef<HTMLAudioElement | null>(null);
  const audioCleanupRef = useRef<(() => void) | null>(null);

  // Cleanup audio on component unmount
  useEffect(() => {
    return () => {
      if (audioCleanupRef.current) {
        audioCleanupRef.current();
      }
    };
  }, []);

  // Subscribe to real-time databases
  useEffect(() => {
    if (!user) return;

    // 1. Participant profile (for individual duty)
    const unsubProfile = onSnapshot(doc(db, 'participants', user.uid), (docSnap) => {
      if (docSnap.exists()) {
        setProfile({ id: docSnap.id, ...docSnap.data() } as ParticipantProfile);
      }
    });

    // 2. All participants (for general duty list)
    const unsubAllParticipants = onSnapshot(collection(db, 'participants'), (snap) => {
      const list: ParticipantProfile[] = [];
      snap.forEach((docSnap) => {
        list.push({ id: docSnap.id, ...docSnap.data() } as ParticipantProfile);
      });
      setAllParticipants(list);
    });

    // 3. Itinerary stops (for alarm calculations)
    const unsubItinerary = onSnapshot(collection(db, 'itinerary'), (snap) => {
      const data: Record<string, any[]> = {};
      snap.forEach((docSnap) => {
        data[docSnap.id] = docSnap.data().stops;
      });
      if (Object.keys(data).length === 4) {
        setDbItinerary(data);
      }
    });

    // 4. Latest broadcast notification
    const qNotif = query(collection(db, 'notifications'), orderBy('timestamp', 'desc'), limit(1));
    const unsubNotifications = onSnapshot(qNotif, (snap) => {
      if (!snap.empty) {
        const docSnap = snap.docs[0];
        const notifData = { id: docSnap.id, ...docSnap.data() } as NotificationMsg;
        
        // Check if this notification has been dismissed locally
        const dismissed = localStorage.getItem(`dismissed_notif_${docSnap.id}`) === 'true';
        if (!dismissed) {
          setLatestNotification(notifData);
          setShowNotificationBanner(true);
        }
      }
    });

    return () => {
      unsubProfile();
      unsubAllParticipants();
      unsubItinerary();
      unsubNotifications();
    };
  }, [user]);

  // Sync alarm settings to localStorage
  useEffect(() => {
    localStorage.setItem('alarm_audio_enabled', String(audioEnabled));
    if (!audioEnabled && audioCleanupRef.current) {
      audioCleanupRef.current();
      audioCleanupRef.current = null;
    }
  }, [audioEnabled]);

  useEffect(() => {
    localStorage.setItem('alarm_notif_enabled', String(notifEnabled));
    if (notifEnabled && Notification.permission === 'default') {
      Notification.requestPermission();
    }
  }, [notifEnabled]);

  // Determine current active trip day (Oslo time base)
  const getActiveTripDay = () => {
    const now = new Date();
    const dateString = now.toLocaleDateString('en-US', { weekday: 'long' }).toLowerCase();
    if (['thursday', 'friday', 'saturday', 'sunday'].includes(dateString)) {
      return dateString;
    }
    return 'thursday'; // Default/mock fallback during development
  };

  // Play beautiful Quran verses from everyayah.com for about 20 seconds, with synth fallback
  const playAlarmSound = (alarmType?: 'location' | 'prayer' | 'test') => {
    // Stop any existing playback and clear timeouts/intervals
    if (audioCleanupRef.current) {
      audioCleanupRef.current();
      audioCleanupRef.current = null;
    }

    // Determine the verses to play (Alafasy_128kbps recitation)
    let verses: { surah: number; ayah: number }[] = [];
    if (alarmType === 'prayer') {
      // Surah Taha 20:14 ("Indeed, I am Allah... establish prayer for My remembrance")
      verses = [{ surah: 20, ayah: 14 }];
    } else if (alarmType === 'location') {
      // Surah Az-Zukhruf 43:13-14 (Travel supplication: "Subhanalladhi sakhkhara lana...")
      verses = [
        { surah: 43, ayah: 13 },
        { surah: 43, ayah: 14 }
      ];
    } else {
      // Default / test alarm: Ayat al-Kursi (Surah 2:255)
      verses = [{ surah: 2, ayah: 255 }];
    }

    const urls = verses.map(v => {
      const surahStr = String(v.surah).padStart(3, '0');
      const ayahStr = String(v.ayah).padStart(3, '0');
      return `https://everyayah.com/data/Alafasy_128kbps/${surahStr}${ayahStr}.mp3`;
    });

    // Fallback synth function (ding-dong sound)
    const playSynthFallback = () => {
      try {
        const AudioCtx = window.AudioContext || (window as any).webkitAudioContext;
        if (!AudioCtx) return;
        const ctx = new AudioCtx();
        // First chime: 880Hz (A5)
        const osc1 = ctx.createOscillator();
        const gain1 = ctx.createGain();
        osc1.type = 'sine';
        osc1.frequency.setValueAtTime(880, ctx.currentTime);
        gain1.gain.setValueAtTime(0.12, ctx.currentTime);
        gain1.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.4);
        osc1.connect(gain1);
        gain1.connect(ctx.destination);
        osc1.start();
        osc1.stop(ctx.currentTime + 0.45);

        // Second chime: 660Hz (E5) at 0.28s delay
        setTimeout(() => {
          const osc2 = ctx.createOscillator();
          const gain2 = ctx.createGain();
          osc2.type = 'sine';
          osc2.frequency.setValueAtTime(660, ctx.currentTime);
          gain2.gain.setValueAtTime(0.12, ctx.currentTime);
          gain2.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
          osc2.connect(gain2);
          gain2.connect(ctx.destination);
          osc2.start();
          osc2.stop(ctx.currentTime + 0.55);
        }, 280);
      } catch (err) {
        console.error("Synthesizer playback error:", err);
      }
    };

    let currentIndex = 0;
    let mainTimeoutId: any = null;
    let fadeIntervalId: any = null;
    let isFading = false;

    const playNext = () => {
      if (currentIndex >= urls.length || isFading) return;

      const audio = new Audio(urls[currentIndex]);
      activeAudioRef.current = audio;

      audio.play().catch(err => {
        console.warn("Audio playback failed, falling back to synth chime:", err);
        playSynthFallback();
      });

      audio.onended = () => {
        currentIndex++;
        if (currentIndex < urls.length && !isFading) {
          playNext();
        }
      };
    };

    // Start playing first verse
    playNext();

    // Fade-out setup: Limit playback to 20 seconds total
    const playDuration = 20000; // 20 seconds total
    const fadeDuration = 1500;  // Fade out over last 1.5 seconds

    mainTimeoutId = setTimeout(() => {
      isFading = true;
      const audio = activeAudioRef.current;
      if (audio) {
        let volume = 1.0;
        fadeIntervalId = setInterval(() => {
          volume -= 0.1;
          if (volume <= 0) {
            clearInterval(fadeIntervalId);
            audio.pause();
            if (activeAudioRef.current === audio) {
              activeAudioRef.current = null;
            }
          } else {
            audio.volume = Math.max(0, volume);
          }
        }, fadeDuration / 10);
      }
    }, playDuration - fadeDuration);

    const cleanup = () => {
      clearTimeout(mainTimeoutId);
      if (fadeIntervalId) clearInterval(fadeIntervalId);
      if (activeAudioRef.current) {
        activeAudioRef.current.pause();
        activeAudioRef.current = null;
      }
    };

    audioCleanupRef.current = cleanup;
  };

  // Fire a Browser Notification
  const triggerNotification = (title: string, body: string) => {
    if (notifEnabled && Notification.permission === 'granted') {
      new Notification(title, {
        body,
        icon: '/favicon.svg'
      });
    }
  };

  // Test Alarm triggers instantly
  const handleTestAlarm = () => {
    playAlarmSound('test');
    triggerNotification("🔔 Alarm Test", "This is a test notification from the road trip alarm chimer!");
    showInfo("Test alarm chime triggered! Verify audio sound and notification popups.");
  };

  // Alarm clock monitor loop
  useEffect(() => {
    const activeDay = getActiveTripDay();
    const stopsRaw = dbItinerary[activeDay] || defaultItinerary[activeDay];
    const resolvedStopsList = resolveStops(activeDay, stopsRaw);

    const checkAlarms = () => {
      const now = new Date();
      const currentHours = now.getHours();
      const currentMins = now.getMinutes();

      // Formulate alarms list for display
      const alarmsList = resolvedStopsList
        .filter(stop => stop.type === 'location' || stop.type === 'prayer')
        .map(stop => {
          const [hStr, mStr] = stop.time.split(':');
          const stopHours = parseInt(hStr, 10);
          const stopMins = parseInt(mStr, 10);
          
          // Calculate alert time (10 minutes before)
          let alertHours = stopHours;
          let alertMins = stopMins - 10;
          if (alertMins < 0) {
            alertMins += 60;
            alertHours = (alertHours - 1 + 24) % 24;
          }

          const alertTimeStr = `${String(alertHours).padStart(2, '0')}:${String(alertMins).padStart(2, '0')}`;
          return {
            label: stop.label,
            time: stop.time,
            type: stop.type,
            alertTime: alertTimeStr,
            stopHours,
            stopMins,
            alertHours,
            alertMins
          };
        });

      setUpcomingAlarms(alarmsList);

      // Perform checks against current clock
      alarmsList.forEach(alarm => {
        const alarmKey = `${alarm.label}-${alarm.time}`;
        if (currentHours === alarm.alertHours && currentMins === alarm.alertMins) {
          // If we haven't triggered this alarm in the current session
          if (!triggeredAlarmsRef.current.has(alarmKey)) {
            triggeredAlarmsRef.current.add(alarmKey);
            
            // Trigger effects
            if (audioEnabled) playAlarmSound(alarm.type);
            triggerNotification(
              "⚠️ Upcoming Trip Event (10 mins)",
              `"${alarm.label}" scheduled at ${alarm.time}. Please prepare!`
            );
          }
        }
      });
    };

    // Run check immediately and start 10s interval
    checkAlarms();
    const interval = setInterval(checkAlarms, 10000);

    return () => clearInterval(interval);
  }, [dbItinerary, audioEnabled, notifEnabled]);

  const dismissNotification = () => {
    if (latestNotification) {
      localStorage.setItem(`dismissed_notif_${latestNotification.id}`, 'true');
      setShowNotificationBanner(false);
    }
  };

  const cards = [
    {
      title: t('nav.rules'),
      description: t('dashboard.cards.rules_desc', 'Review and sign the mandatory trip rules.'),
      icon: ScrollText,
      to: '/rules',
      color: 'bg-blue-500',
    },
    {
      title: t('dashboard.cards.itinerary_title', 'Itinerary & Stops'),
      description: t('dashboard.cards.itinerary_desc', 'View the route, breaks, and prayer times.'),
      icon: Map,
      to: '/itinerary',
      color: 'bg-emerald-500',
    },

    {
      title: t('nav.checklist'),
      description: t('dashboard.cards.checklist_desc', 'Check your packing list and where to buy items.'),
      icon: CheckSquare,
      to: '/checklist',
      color: 'bg-rose-500',
    },
    {
      title: t('nav.complaints'),
      description: t('dashboard.cards.complaints_desc', 'Submit concerns privately to the handler.'),
      icon: MessageSquare,
      to: '/complaints',
      color: 'bg-amber-500',
    }
  ];

  return (
    <div className="space-y-8">
      {/* Broadcast Notifications Alert Banner */}
      {showNotificationBanner && latestNotification && (
        <div className="glass bg-amber-500/10 dark:bg-amber-500/5 border border-amber-500/30 p-5 rounded-3xl flex flex-col sm:flex-row gap-4 items-start justify-between shadow-sm animate-pulse">
          <div className="flex gap-3">
            <div className="w-10 h-10 bg-amber-500/20 text-amber-600 dark:text-amber-400 rounded-xl flex items-center justify-center shrink-0">
              <Bell className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider block">
                {t('dashboard.broadcast', '🚨 BROADCAST: {{title}}', { title: latestNotification.title })}
              </span>
              <p className="text-sm font-semibold text-slate-800 dark:text-slate-200 mt-1">{latestNotification.message}</p>
            </div>
          </div>
          <button
            onClick={dismissNotification}
            className="text-xs font-bold bg-amber-500/20 text-amber-800 dark:text-amber-300 px-3 py-1.5 rounded-lg hover:bg-amber-500/35 transition-colors self-end sm:self-center"
          >
            {t('dashboard.dismiss', 'Dismiss')}
          </button>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 animate-slide-up" style={{ animationDelay: '0.1s' }}>
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-900 dark:from-primary-400 dark:to-primary-200">
            {t('dashboard.title', 'Dashboard')}
          </h1>
          <div className="flex items-center flex-wrap gap-2 mt-2">
            <p className="text-slate-500 font-medium">
              {t('dashboard.welcome_back', 'Welcome back, {{name}}.', { name: profile?.name || user?.displayName || 'Participant' })}
            </p>
            <button
              onClick={handleOpenEditName}
              className="p-1 bg-slate-105 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 rounded-lg transition-colors text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-200 flex items-center justify-center cursor-pointer"
              title={t('dashboard.edit_name', 'Edit Name')}
            >
              <Pencil className="w-3 h-3" />
            </button>
            {(!profile?.name || profile.name === 'Participant') && (
              <span className="text-xs font-bold bg-amber-100 dark:bg-amber-900/30 text-amber-600 dark:text-amber-400 px-2.5 py-0.5 rounded-full animate-pulse">
                {t('dashboard.set_name_prompt', 'Please set name')}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Duty Assignment Banner */}
      <div className="glass p-6 rounded-3xl border border-card-border flex flex-col md:flex-row gap-6 items-start md:items-center justify-between animate-slide-up" style={{ animationDelay: '0.2s' }}>
        <div className="flex gap-4 items-center">
          <div className="w-14 h-14 bg-primary-100 dark:bg-primary-900/30 text-primary-600 dark:text-primary-400 rounded-2xl flex items-center justify-center shrink-0">
            <UserCheck className="w-8 h-8" />
          </div>
          <div>
            <span className="text-xs font-bold text-slate-500 uppercase tracking-wider block">{t('dashboard.assigned_duty', 'Assigned Trip Duty')}</span>
            <h2 className="text-xl font-bold text-slate-800 dark:text-slate-100 mt-0.5">
              {profile?.duty 
                ? (t(getDutyTranslationKey(profile.duty)) || profile.duty) 
                : t('dashboard.general_help', 'General Help / Passenger')}
            </h2>
            <p className="text-xs italic text-primary-600 dark:text-primary-400 mt-1 max-w-xl font-medium leading-relaxed">
              {t('role_quran.' + getRoleKey(profile?.duty))}
            </p>
          </div>
        </div>
        
        <button
          onClick={() => setShowDutiesList(!showDutiesList)}
          className="text-sm font-bold bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 px-5 py-2.5 rounded-xl transition-all"
        >
          {showDutiesList ? t('dashboard.hide_roles', 'Hide Assigned Roles') : t('dashboard.view_roles', 'View Passenger Roles')}
        </button>
      </div>

      {/* Passenger Roles Collapsed Grid */}
      {showDutiesList && (
        <div className="glass p-6 rounded-3xl border border-card-border animate-slide-down">
          <h3 className="font-bold text-lg mb-4">{t('dashboard.duty_allocations', '👥 Trip Duty Allocations')}</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {allParticipants.map((p) => (
              <div key={p.id} className="bg-slate-50/50 dark:bg-slate-800/20 border border-card-border p-4 rounded-xl flex flex-col justify-between space-y-2">
                <div className="flex justify-between items-start gap-2">
                  <div className="min-w-0">
                    <span className="font-bold block text-slate-800 dark:text-slate-200 text-sm truncate">{p.name}</span>
                    <span className="text-xs text-slate-400 font-mono block truncate">{p.email}</span>
                  </div>
                  <span className="text-xs shrink-0 font-semibold bg-primary-50 dark:bg-primary-900/20 text-primary-600 dark:text-primary-400 px-2.5 py-1 rounded-full text-right max-w-[120px] truncate">
                    {p.duty 
                      ? (t(getDutyTranslationKey(p.duty)) || p.duty) 
                      : t('dashboard.general_help_short', 'General Help')}
                  </span>
                </div>
                <span className="text-xs italic text-slate-500 dark:text-slate-400 block leading-relaxed border-l-2 border-primary-500/30 pl-2 pt-0.5">
                  {t('role_quran.' + getRoleKey(p.duty))}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Alarm Settings & Countdown Widget */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-slide-up" style={{ animationDelay: '0.3s' }}>
        <div className="lg:col-span-2 glass p-6 rounded-3xl border border-card-border flex flex-col justify-between space-y-6">
          <div>
            <h3 className="font-bold text-lg flex items-center gap-1.5">
              {t('dashboard.alarms_title', '⏰ Trip Departure & Prayer Alarms')}
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              {t('dashboard.alarms_desc', 'Warning chimes play exactly **10 minutes before** major departures and scheduled prayer times on the road.')}
            </p>
          </div>

          <div className="flex flex-wrap gap-4">
            <button
              onClick={() => setAudioEnabled(!audioEnabled)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm cursor-pointer ${
                audioEnabled ? 'bg-emerald-500 text-white hover:bg-emerald-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
              }`}
            >
              {audioEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
              {audioEnabled ? t('dashboard.audio_enabled', 'Audio Chime Enabled') : t('dashboard.audio_muted', 'Audio Chime Muted')}
            </button>

            <button
              onClick={() => setNotifEnabled(!notifEnabled)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-bold text-sm transition-all shadow-sm cursor-pointer ${
                notifEnabled ? 'bg-primary-500 text-white hover:bg-primary-600' : 'bg-slate-200 dark:bg-slate-700 text-slate-500 dark:text-slate-300'
              }`}
            >
              {notifEnabled ? t('dashboard.notif_active', '🔔 Notifications Active') : t('dashboard.notif_off', '🔕 Notifications Off')}
            </button>

            <button
              onClick={handleTestAlarm}
              className="px-4 py-2.5 border border-card-border rounded-xl font-bold text-sm bg-white dark:bg-slate-800 hover:bg-slate-50 dark:hover:bg-slate-700 transition-all text-slate-700 dark:text-slate-200 cursor-pointer"
            >
              {t('dashboard.test_alarm', '🔊 Test Sound & Notification')}
            </button>
          </div>
        </div>

        <div className="glass p-6 rounded-3xl border border-card-border flex flex-col justify-between">
          <h4 className="font-bold text-xs uppercase tracking-wider text-slate-500">
            {t('dashboard.upcoming_alarms', 'Upcoming Alarms Today ({{day}})', { day: getActiveTripDay().toUpperCase() })}
          </h4>
          
          <div className="mt-4 space-y-3 max-h-[140px] overflow-y-auto pr-1">
            {upcomingAlarms.length === 0 ? (
              <p className="text-xs text-slate-400 italic">{t('dashboard.no_alarms', 'No alerts scheduled for today.')}</p>
            ) : (
              upcomingAlarms.slice(0, 3).map((alarm, idx) => (
                <div key={idx} className="flex justify-between items-center border-b border-card-border pb-2 last:border-b-0 text-xs">
                  <div>
                    <span className="font-bold text-slate-800 dark:text-slate-200 block truncate max-w-[150px]">{alarm.label}</span>
                    <span className="text-xs text-slate-400">
                      {t('dashboard.warning_at', 'Warning at {{time}}', { time: alarm.alertTime })}
                    </span>
                  </div>
                  <span className="font-mono bg-amber-500/10 text-amber-600 dark:text-amber-400 font-bold px-2 py-0.5 rounded">
                    {alarm.time}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

      {/* Grid Menu Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {cards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <Link 
              key={idx} 
              to={card.to}
              className="glass p-6 rounded-3xl flex items-start gap-5 hover-lift group animate-slide-up"
              style={{ animationDelay: `${0.4 + (idx * 0.1)}s` }}
            >
              <div className={`${card.color} w-14 h-14 rounded-2xl flex items-center justify-center text-white shrink-0 shadow-lg shadow-${card.color.split('-')[1]}-500/40 group-hover:scale-110 group-hover:rotate-3 transition-all duration-300`}>
                <Icon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-semibold mb-1 group-hover:text-primary-600 transition-colors">{card.title}</h3>
                <p className="text-slate-500 text-sm leading-relaxed">{card.description}</p>
              </div>
            </Link>
          );
        })}
      </div>
      
      {/* Trip Progress Bar */}
      <div className="glass p-6 rounded-2xl mt-8">
        <h2 className="text-xl font-bold mb-4">{t('dashboard.progress_title', 'Trip Progress')}</h2>
        <div className="w-full bg-slate-100 dark:bg-slate-800 rounded-full h-4 overflow-hidden relative">
          <div className="bg-primary-500 h-full w-1/4 rounded-full relative z-10"></div>
          {/* Stops markers */}
          <div className="absolute top-0 w-full h-full flex justify-between px-2 items-center z-20">
            <div className="w-2 h-2 rounded-full bg-white shadow-sm"></div>
            <div className="w-2 h-2 rounded-full bg-white shadow-sm"></div>
            <div className="w-2 h-2 rounded-full bg-white shadow-sm"></div>
            <div className="w-2 h-2 rounded-full bg-white shadow-sm"></div>
          </div>
        </div>
        <div className="flex justify-between text-xs text-slate-500 font-medium uppercase tracking-wider mt-3">
          <span>Oslo</span>
          <span>Geilo</span>
          <span>Stryn</span>
          <span>Geiranger</span>
        </div>
      </div>

      {/* Edit Name Modal */}
      {isEditingName && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fade-in">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-md w-full border border-card-border shadow-2xl relative space-y-6">
            <div>
              <h3 className="text-xl font-bold text-slate-900 dark:text-slate-100">
                {t('dashboard.edit_name_title', 'Edit Profile Name')}
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                {t('dashboard.edit_name_desc', 'Update how your name appears on the passenger dashboard and allocations.')}
              </p>
            </div>

            <form onSubmit={handleSaveName} className="space-y-4">
              {/* Salutation Pill Selector */}
              <div>
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2">
                  {t('dashboard.salutation', 'Salutation')}
                </label>
                <div className="flex gap-2">
                  {['Brother', 'Sister', ''].map((sal) => (
                    <button
                      key={sal || 'none'}
                      type="button"
                      onClick={() => setEditSalutation(sal)}
                      className={`flex-1 py-2 px-3 rounded-xl font-semibold text-sm border transition-all cursor-pointer ${
                        editSalutation === sal
                          ? 'bg-primary-500 text-white border-primary-500 shadow-md shadow-primary-500/20'
                          : 'bg-slate-50 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-750'
                      }`}
                    >
                      {sal === 'Brother' && t('dashboard.brother', 'Brother')}
                      {sal === 'Sister' && t('dashboard.sister', 'Sister')}
                      {sal === '' && t('dashboard.none', 'None')}
                    </button>
                  ))}
                </div>
              </div>

              {/* First Name Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t('dashboard.first_name', 'First Name')}
                </label>
                <input
                  type="text"
                  required
                  value={editFirstName}
                  onChange={(e) => setEditFirstName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                  placeholder="e.g. Maryam"
                />
              </div>

              {/* Last Name Input */}
              <div className="space-y-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider">
                  {t('dashboard.last_name', 'Last Name')}
                </label>
                <input
                  type="text"
                  required
                  value={editLastName}
                  onChange={(e) => setEditLastName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-800 dark:text-slate-100"
                  placeholder="e.g. Imran"
                />
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setIsEditingName(false)}
                  disabled={savingName}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
                >
                  {t('dashboard.cancel', 'Cancel')}
                </button>
                <button
                  type="submit"
                  disabled={savingName}
                  className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-primary-600 hover:bg-primary-700 text-white shadow-md shadow-primary-500/10 transition-colors disabled:opacity-50 cursor-pointer"
                >
                  {savingName ? t('dashboard.saving', 'Saving...') : t('dashboard.save', 'Save')}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
