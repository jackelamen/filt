import { useEffect, useMemo, useRef, useState } from "react";
import type { DiaperLog, FeedingSession, FeedingType, Settings, Side } from "./types";
import {
  clearActiveSession,
  getDiaperLogs,
  getActiveSession,
  getSessions,
  getSettings,
  removeSession,
  removeDiaperLog,
  saveActiveSession,
  saveDiaperLog,
  saveSession,
  saveSettings,
} from "./storage";
import { nextInterval } from "./interval";
import { Logo } from "./Logo";
import { Icon } from "./Icon";
import { MotherMark } from "./MotherMark";

type Screen = "home" | "running" | "summary" | "settings";
const copy = {
  ko: {
    start: "수유 시작",
    stop: "수유 종료",
    breast: "모유",
    bottle: "분유",
    left: "왼쪽",
    right: "오른쪽",
    diaper: "기저귀 교체",
    diaperLog: "기저귀 교체 기록",
    diaperLast: "마지막 기저귀",
    diaperSaved: "기저귀 교체 기록됨",
    today: "오늘",
    feedings: "회 수유",
    last: "마지막",
    ago: "전",
    next: "다음 수유 예정",
    now: "지금",
    ready: "준비되면 시작하세요",
    readyDetail: "한 번의 탭으로 수유를 기록할 수 있어요.",
    progress: "수유 중",
    window: "다음 수유 창",
    summary: "오늘 수유 요약",
    viewSummary: "오늘 요약",
    back: "타이머",
    total: "총 수유",
    duration: "총 시간",
    diapers: "기저귀",
    export: "PDF 내보내기",
    settings: "설정",
    empty: "오늘 기록된 수유가 없습니다",
    undo: "실행 취소",
    saved: "수유 기록 저장됨",
    baby: "아기 이름",
    birth: "생년월일",
    close: "닫기",
    advice: "간격은 기록을 바탕으로 한 참고 정보이며 의학적 조언이 아닙니다.",
    backup: "내 데이터 백업",
    backupDetail: "모든 기록을 JSON 파일로 저장합니다.",
  },
  en: {
    start: "START",
    stop: "STOP",
    breast: "Breast",
    bottle: "Bottle",
    left: "Left",
    right: "Right",
    diaper: "Diapers",
    diaperLog: "Log diaper change",
    diaperLast: "Last diaper",
    diaperSaved: "Diaper change recorded",
    today: "Today",
    feedings: "feedings",
    last: "Last",
    ago: "ago",
    next: "Next feeding in",
    now: "now",
    ready: "Ready when you are",
    readyDetail: "One tap starts a feeding record.",
    progress: "Feeding in progress",
    window: "Next feeding window",
    summary: "Today Summary",
    viewSummary: "Today",
    back: "Timer",
    total: "Total feedings",
    duration: "Total time",
    diapers: "Diapers",
    export: "Export PDF",
    settings: "Settings",
    empty: "No feeding records today",
    undo: "Undo",
    saved: "Feeding saved",
    baby: "Baby's name",
    birth: "Birth date",
    close: "Close",
    advice:
      "Timing guidance is based on your records and is not medical advice.",
    backup: "Back up my data",
    backupDetail: "Saves all your records as a JSON file.",
  },
};
const dayStart = (n = Date.now()) =>
  new Date(new Date(n).setHours(0, 0, 0, 0)).getTime();
const duration = (ms: number) => {
  const s = Math.max(0, Math.floor(ms / 1000));
  return `${String(Math.floor(s / 3600)).padStart(2, "0")}:${String(Math.floor((s % 3600) / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
};
const shortDuration = (ms: number) => {
  const m = Math.round(ms / 60000);
  return m >= 60 ? `${Math.floor(m / 60)}h ${m % 60}m` : `${m}m`;
};
const clock = (n: number) =>
  new Intl.DateTimeFormat("ko-KR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(n);
const remaining = (ms: number) => {
  const m = Math.max(0, Math.ceil(ms / 60000));
  return `${Math.floor(m / 60)}h ${m % 60}m`;
};
const getAge = (date: string) =>
  date
    ? Math.max(
        0,
        Math.floor((Date.now() - new Date(date).getTime()) / 86400000),
      )
    : 0;

export default function App() {
  const [sessions, setSessions] = useState<FeedingSession[]>(getSessions);
  const [settings, setSettings] = useState<Settings>(getSettings);
  const [screen, setScreen] = useState<Screen>(() =>
    getActiveSession() ? "running" : "home",
  );
  const [type, setType] = useState<FeedingType>(
    () => getSessions()[0]?.feedingType ?? "breast",
  );
  const [side, setSide] = useState<Side>(() => {
    const last = getSessions()[0];
    if (last?.feedingType === "breast" && last.breastSide) {
      return last.breastSide === "left" ? "right" : "left";
    }
    return "left";
  });
  const [volume, setVolume] = useState<number | null>(60);
  const [diapers, setDiapers] = useState<DiaperLog[]>(getDiaperLogs);
  const [active, setActive] = useState<FeedingSession | null>(getActiveSession);
  const [now, setNow] = useState(Date.now());
  const [toast, setToast] = useState<{
    message: string;
    until: number;
    onUndo: () => void;
  } | null>(null);
  const touchX = useRef<number | null>(null);
  const t = copy[settings.language];
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, []);
  useEffect(() => {
    if (toast && now > toast.until) setToast(null);
  }, [now, toast]);
  useEffect(() => {
    saveSettings(settings);
    document.documentElement.lang = settings.language;
  }, [settings]);
  const today = useMemo(
    () =>
      sessions
        .filter((s) => s.startTime >= dayStart())
        .sort((a, b) => b.startTime - a.startTime),
    [sessions],
  );
  const last = sessions[0];
  const interval = nextInterval(last, getAge(settings.birthDate), sessions);
  const lastUsed: Side | null =
    sessions.find((s) => s.feedingType === "breast")?.breastSide || null;
  const start = () => {
    navigator.vibrate?.(10);
    const time = Date.now();
    const session = {
      id: crypto.randomUUID(),
      startTime: time,
      endTime: null,
      durationMs: 0,
      feedingType: type,
      breastSide: type === "breast" ? side : null,
      volumeMl: type === "bottle" ? volume : null,
      diaperChanged: false,
      notes: "",
      createdAt: time,
    };
    saveActiveSession(session);
    setActive(session);
    setScreen("running");
  };
  const stop = () => {
    if (!active) return;
    navigator.vibrate?.(10);
    const finished = {
      ...active,
      endTime: Date.now(),
      durationMs: Date.now() - active.startTime,
    };
    clearActiveSession();
    setActive(null);
    if (finished.feedingType === "breast" && finished.breastSide) {
      setSide(finished.breastSide === "left" ? "right" : "left");
    }
    // Ignore accidental taps (mis-hit START then immediately STOP) rather
    // than saving a spurious sub-5-second session that would pollute the
    // timeline/PDF and skew the interval algorithm's "short feed" logic.
    if (finished.durationMs < 5000) {
      setScreen("home");
      return;
    }
    setSessions(saveSession(finished));
    setToast({
      message: t.saved,
      until: Date.now() + 5000,
      onUndo: () => {
        removeSession(finished.id);
        setSessions(getSessions());
      },
    });
    setScreen("home");
  };
  const undo = () => {
    if (!toast) return;
    toast.onUndo();
    setToast(null);
  };
  const logDiaper = () => {
    navigator.vibrate?.(10);
    const log = { id: crypto.randomUUID(), changedAt: Date.now(), createdAt: Date.now() };
    setDiapers(saveDiaperLog(log));
    setToast({
      message: t.diaperSaved,
      until: Date.now() + 5000,
      onUndo: () => {
        removeDiaperLog(log.id);
        setDiapers(getDiaperLogs());
      },
    });
  };
  const exportBackup = () => {
    const payload = {
      exportedAt: new Date().toISOString(),
      sessions,
      diapers,
      settings,
    };
    const blob = new Blob([JSON.stringify(payload, null, 2)], {
      type: "application/json",
    });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `filt-backup-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };
  const exportPdf = async () => {
    const { jsPDF } = await import("jspdf");
    const doc = new jsPDF();
    doc.setFontSize(20);
    doc.text("Baby Dawn Feeding Report", 20, 20);
    doc.setFontSize(11);
    doc.text(
      `${settings.babyName || "Baby"} · ${new Date().toLocaleDateString()}`,
      20,
      30,
    );
    doc.text(
      `Total: ${today.length} feeds · ${shortDuration(today.reduce((a, s) => a + s.durationMs, 0))}`,
      20,
      38,
    );
    doc.text(
      `Diaper changes: ${diapers.filter((log) => log.changedAt >= dayStart()).length + today.filter((session) => session.diaperChanged).length}`,
      20,
      45,
    );
    today
      .slice()
      .reverse()
      .forEach((s, i) =>
        doc.text(
          `${clock(s.startTime)}  ${labelFor(s)}  ${shortDuration(s.durationMs)}${s.diaperChanged ? "  + diaper" : ""}`,
          20,
          59 + i * 8,
        ),
      );
    doc.save(
      `filt-feeding-report-${new Date().toISOString().slice(0, 10)}.pdf`,
    );
  };
  const navigate = (e: React.TouchEvent) => {
    if (touchX.current === null) return;
    const d = e.changedTouches[0].clientX - touchX.current;
    if (Math.abs(d) > 70) {
      if (screen === "home" && d < 0) setScreen("summary");
      if (screen === "summary" && d > 0) setScreen("home");
    }
    touchX.current = null;
  };
  return (
    <main
      className="app"
      onTouchStart={(e) => {
        touchX.current = e.touches[0].clientX;
      }}
      onTouchEnd={navigate}
    >
      <header>
        <div className="brand">
          <Logo size={30} />
          <b>Baby Dawn</b>
        </div>
        <button
          className="language"
          onClick={() =>
            setSettings({
              ...settings,
              language: settings.language === "ko" ? "en" : "ko",
            })
          }
        >
          <b className={settings.language === "ko" ? "activeLang" : ""}>KO</b>
          <i>|</i>
          <b className={settings.language === "en" ? "activeLang" : ""}>EN</b>
        </button>
      </header>
      {screen === "home" && (
        <Home
          t={t}
          today={today}
          last={last}
          interval={interval.ms}
          confidence={interval.confidence}
          type={type}
          setType={setType}
          side={side}
          setSide={setSide}
          lastUsed={lastUsed}
          volume={volume}
          setVolume={setVolume}
        diapers={diapers}
        logDiaper={logDiaper}
          start={start}
        openSettings={() => setScreen("settings")}
        openSummary={() => setScreen("summary")}
        />
      )}
      {screen === "running" && active && (
        <Running
          t={t}
          active={active}
          now={now}
          interval={interval.ms}
          confidence={interval.confidence}
          stop={stop}
        />
      )}
      {screen === "summary" && (
      <Summary
        t={t}
        language={settings.language}
        today={today}
        diapers={diapers}
        exportPdf={exportPdf}
        goHome={() => setScreen("home")}
          openSettings={() => setScreen("settings")}
        />
      )}
      {screen === "settings" && (
        <SettingsView
          t={t}
          settings={settings}
          update={setSettings}
          close={() => setScreen("home")}
          exportBackup={exportBackup}
        />
      )}
      {toast && (
        <div className="toast">
          <span>✓ {toast.message}</span>
          <button onClick={undo}>{t.undo}</button>
        </div>
      )}
    </main>
  );
}

function Home({
  t,
  today,
  last,
  interval,
  confidence,
  type,
  setType,
  side,
  setSide,
  lastUsed,
  volume,
  setVolume,
  diapers,
  logDiaper,
  start,
  openSummary,
  openSettings,
}: any) {
  const since = last ? remaining(Date.now() - last.startTime) : "—";
  const untilNext = last
    ? interval - (Date.now() - last.startTime)
    : 105 * 60000;
  return (
    <section className="screen home">
      <div className="status">
        <span>
          {t.today}:{" "}
          <b>
            {today.length}
            {t.feedings}
          </b>
        </span>
        <span>
          {t.last}: {last ? `${since} ${t.ago || ""}` : "—"}
        </span>
      </div>
      <div className="card">
        {!last && (
          <div className="welcome">
            <MotherMark size={118} />
            <strong>{t.ready}</strong>
            <span>{t.readyDetail}</span>
          </div>
        )}
        <div className="mode">
          <button
            className={type === "breast" ? "selected" : ""}
            onClick={() => setType("breast")}
          >
            {t.breast}
          </button>
          <button
            className={type === "bottle" ? "selected" : ""}
            onClick={() => setType("bottle")}
          >
            {t.bottle}
          </button>
        </div>
        {type === "breast" ? (
          <div className="sides">
            <button
              aria-label="Left breast"
              className={side === "left" ? "selected" : ""}
              onClick={() => setSide("left")}
            >
              <Icon name="left" size={16} /> {t.left}
              <small>{lastUsed === "left" ? "•" : ""}</small>
            </button>
            <button
              aria-label="Right breast"
              className={side === "right" ? "selected" : ""}
              onClick={() => setSide("right")}
            >
              {t.right} <Icon name="right" size={16} />
              <small>{lastUsed === "right" ? "•" : ""}</small>
            </button>
          </div>
        ) : (
          <div className="volume">
            <label>
              <Icon name="bottle" size={20} />
            </label>
            <input
              aria-label="Bottle volume in millilitres"
              type="number"
              min="0"
              max="500"
              step="5"
              value={volume ?? ""}
              onChange={(e) =>
                setVolume(e.target.value ? Number(e.target.value) : null)
              }
            />
            <span>ml</span>
            <div className="presets">
              {[30, 60, 90, 120].map((n) => (
                <button
                  key={n}
                  className={volume === n ? "selected" : ""}
                  onClick={() => setVolume(volume === n ? null : n)}
                >
                  {n}ml
                </button>
              ))}
            </div>
          </div>
        )}
        <button className="big start" onClick={start}>
          <Icon name="play" size={18} />
          <span>{t.start}</span>
        </button>
        <button className="diaperAction" onClick={logDiaper}>
          <span>
            <Icon name="diaper" size={19} />
          </span>
          <span>{t.diaperLog}</span>
          <small>
            {t.diaperLast}: {diapers[0] ? `${remaining(Date.now() - diapers[0].changedAt)} ${t.ago}` : "—"}
          </small>
        </button>
      </div>
      <footer>
        <span className="interval">
          <em className={`dot-${confidence}`} />
          <Icon name="clock" size={13} /> {t.next}:{" "}
          <b>{untilNext <= 0 ? t.now : remaining(untilNext)}</b>
        </span>
        <div className="footerActions">
          <button className="summaryShortcut" onClick={openSummary}>
            <Icon name="chart" size={15} /> {t.viewSummary}
          </button>
          <button
            className="iconBtn"
            aria-label={t.settings}
            onClick={openSettings}
          >
            <Icon name="settings" size={20} />
          </button>
        </div>
      </footer>
    </section>
  );
}
function Running({ t, active, now, interval, confidence, stop }: any) {
  const untilNext = interval - (now - active.startTime);
  return (
    <section className="screen running">
      <div className="runningBox">
        <p>{t.progress}</p>
        <div className="elapsed">{duration(now - active.startTime)}</div>
        <div className="window">
          <em className={`dot-${confidence}`} />
          <Icon name="clock" size={14} /> {t.window}:{" "}
          {untilNext <= 0 ? t.now : remaining(untilNext)}
        </div>
        <button className="big stop" onClick={stop}>
          <Icon name="stop" size={16} />
          <span>{t.stop}</span>
        </button>
        <small>
          {labelFor(active)}
          {active.volumeMl ? ` · ${active.volumeMl}ml` : ""}
        </small>
      </div>
    </section>
  );
}
function Summary({ t, language, today, diapers, exportPdf, goHome, openSettings }: any) {
  const total = today.reduce(
    (a: number, s: FeedingSession) => a + s.durationMs,
    0,
  );
  const diaper =
    diapers.filter((log: DiaperLog) => log.changedAt >= dayStart()).length +
    today.filter((session: FeedingSession) => session.diaperChanged).length;
  const max = Math.max(...today.map((s: FeedingSession) => s.durationMs), 1);
  return (
    <section className="screen summary">
      <div className="summaryHead">
        <h1>{t.summary}</h1>
        <button className="back" onClick={goHome}>
          <Icon name="back" size={14} /> {t.back}
        </button>
        <span>
          {new Intl.DateTimeFormat(language === "ko" ? "ko-KR" : "en-US", {
            month: "numeric",
            day: "numeric",
            weekday: "short",
          }).format(new Date())}
        </span>
      </div>
      <div className="stats">
        <Pill value={today.length} label={t.total} />
        <Pill value={shortDuration(total)} label={t.duration} />
        <Pill value={diaper} label={t.diapers} />
      </div>
      {today.length ? (
        <div className="timeline">
          {today
            .slice()
            .reverse()
            .map((s: FeedingSession) => (
              <div className="session" key={s.id}>
                <time>{clock(s.startTime)}</time>
                <div className="bar">
                  <i
                    style={{
                      width: `${Math.max(12, (s.durationMs / max) * 100)}%`,
                    }}
                  />
                </div>
                <b>
                  {labelFor(s)} ·{" "}
                  {s.feedingType === "bottle"
                    ? `${s.volumeMl || 0}ml`
                    : shortDuration(s.durationMs)}
                </b>
              </div>
            ))}
        </div>
      ) : (
        <div className="empty">
          <span>
            <Icon name="moon" size={42} />
          </span>
          <p>{t.empty}</p>
        </div>
      )}
      <div className="summaryActions">
        <button onClick={exportPdf}>
          <Icon name="document" size={16} /> {t.export}
        </button>
        <button onClick={openSettings}>
          <Icon name="settings" size={16} /> {t.settings}
        </button>
      </div>
    </section>
  );
}
function Pill({ value, label }: any) {
  return (
    <div className="pill">
      <strong>{value}</strong>
      <span>{label}</span>
    </div>
  );
}
function SettingsView({ t, settings, update, close, exportBackup }: any) {
  return (
    <section className="screen settings">
      <div className="summaryHead">
        <h1>{t.settings}</h1>
        <button className="iconBtn" aria-label={t.close} onClick={close}>
          <Icon name="close" size={20} />
        </button>
      </div>
      <label>
        {t.baby}
        <input
          value={settings.babyName}
          onChange={(e) => update({ ...settings, babyName: e.target.value })}
          placeholder=""
        />
      </label>
      <label>
        {t.birth}
        <input
          type="date"
          value={settings.birthDate}
          onChange={(e) => update({ ...settings, birthDate: e.target.value })}
        />
      </label>
      <button className="diaperAction" onClick={exportBackup}>
        <span>
          <Icon name="download" size={19} />
        </span>
        <span>{t.backup}</span>
        <small>{t.backupDetail}</small>
      </button>
      <p>{t.advice}</p>
      <button className="big start" onClick={close}>
        {t.close}
      </button>
    </section>
  );
}
function labelFor(s: FeedingSession) {
  return s.feedingType === "bottle"
    ? "Btl"
    : s.breastSide === "left"
      ? "L"
      : "R";
}
