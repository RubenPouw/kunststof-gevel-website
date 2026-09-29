"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useSyncExternalStore,
  type ReactNode,
} from "react";

const STORAGE_KEY = "kg-account-v1";
const CHANGE_EVENT = "kg-account-change";

export type AccountUser = {
  email: string;
  name: string;
  phone: string;
};

export type AccountRequest = {
  email: string;
  type: "offerte" | "stalen";
  reference: string;
  summary: string;
  at: string;
};

type UserRecord = AccountUser & { passwordHash: string };

type Store = {
  users: UserRecord[];
  sessionEmail: string | null;
  requests: AccountRequest[];
};

const emptyStore: Store = { users: [], sessionEmail: null, requests: [] };

type AccountContextValue = {
  user: AccountUser | null;
  requests: AccountRequest[];
  register: (input: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<{ ok: true } | { ok: false; error: string }>;
  login: (email: string, password: string) => Promise<{ ok: true } | { ok: false; error: string }>;
  logout: () => void;
  updateProfile: (input: { name: string; phone: string }) => { ok: true } | { ok: false; error: string };
  addRequest: (input: Omit<AccountRequest, "at"> & { at?: string }) => void;
};

const AccountContext = createContext<AccountContextValue | null>(null);

const emailRe = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function normalizeEmail(email: string) {
  return email.trim().toLowerCase();
}

async function hashPassword(password: string, email: string) {
  const data = new TextEncoder().encode(`${normalizeEmail(email)}::${password}`);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return [...new Uint8Array(digest)].map((byte) => byte.toString(16).padStart(2, "0")).join("");
}

function loadStore(): Store {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return emptyStore;
    const parsed = JSON.parse(raw) as Partial<Store>;
    if (!parsed || !Array.isArray(parsed.users) || !Array.isArray(parsed.requests)) return emptyStore;
    return {
      users: parsed.users,
      sessionEmail: typeof parsed.sessionEmail === "string" ? parsed.sessionEmail : null,
      requests: parsed.requests,
    };
  } catch {
    return emptyStore;
  }
}

let snapshot: Store = emptyStore;
let loaded = false;

function getSnapshot() {
  if (!loaded) {
    snapshot = loadStore();
    loaded = true;
  }
  return snapshot;
}

function getServerSnapshot() {
  return emptyStore;
}

function subscribe(onStoreChange: () => void) {
  window.addEventListener(CHANGE_EVENT, onStoreChange);
  return () => window.removeEventListener(CHANGE_EVENT, onStoreChange);
}

function commit(next: Store) {
  snapshot = next;
  loaded = true;
  localStorage.setItem(STORAGE_KEY, JSON.stringify(next));
  window.dispatchEvent(new Event(CHANGE_EVENT));
}

function toPublic(user: UserRecord): AccountUser {
  return { email: user.email, name: user.name, phone: user.phone };
}

export function AccountProvider({ children }: { children: ReactNode }) {
  const store = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const register = useCallback<AccountContextValue["register"]>(async (input) => {
    const email = normalizeEmail(input.email);
    const name = input.name.trim();
    const phone = input.phone.trim();
    if (name.length < 2) return { ok: false, error: "Vul uw naam in." };
    if (!emailRe.test(email)) return { ok: false, error: "Vul een geldig e-mailadres in." };
    if (phone.replace(/\s/g, "").length < 10) return { ok: false, error: "Vul een geldig telefoonnummer in." };
    if (input.password.length < 8) return { ok: false, error: "Kies een wachtwoord van minstens 8 tekens." };
    const current = getSnapshot();
    if (current.users.some((user) => user.email === email)) {
      return { ok: false, error: "Dit e-mailadres heeft al een account op dit apparaat." };
    }
    const passwordHash = await hashPassword(input.password, email);
    commit({
      ...current,
      sessionEmail: email,
      users: [...current.users, { email, name, phone, passwordHash }],
    });
    return { ok: true };
  }, []);

  const login = useCallback<AccountContextValue["login"]>(async (emailRaw, password) => {
    const email = normalizeEmail(emailRaw);
    const current = getSnapshot();
    const user = current.users.find((item) => item.email === email);
    const passwordHash = await hashPassword(password, email);
    if (!user || user.passwordHash !== passwordHash) {
      return { ok: false, error: "Onbekende combinatie van e-mail en wachtwoord." };
    }
    commit({ ...current, sessionEmail: email });
    return { ok: true };
  }, []);

  const logout = useCallback(() => {
    commit({ ...getSnapshot(), sessionEmail: null });
  }, []);

  const updateProfile = useCallback<AccountContextValue["updateProfile"]>((input) => {
    const current = getSnapshot();
    const email = current.sessionEmail;
    if (!email) return { ok: false, error: "Log eerst in." };
    const name = input.name.trim();
    const phone = input.phone.trim();
    if (name.length < 2) return { ok: false, error: "Vul uw naam in." };
    if (phone.replace(/\s/g, "").length < 10) return { ok: false, error: "Vul een geldig telefoonnummer in." };
    commit({
      ...current,
      users: current.users.map((user) => (user.email === email ? { ...user, name, phone } : user)),
    });
    return { ok: true };
  }, []);

  const addRequest = useCallback<AccountContextValue["addRequest"]>((input) => {
    if (!input.reference || input.reference === "SKIP" || input.reference === "onbekend") return;
    const email = normalizeEmail(input.email);
    if (!email) return;
    const current = getSnapshot();
    const entry: AccountRequest = {
      email,
      type: input.type,
      reference: input.reference,
      summary: input.summary,
      at: input.at ?? new Date().toISOString(),
    };
    commit({
      ...current,
      requests: [
        entry,
        ...current.requests.filter((item) => !(item.email === email && item.reference === entry.reference)),
      ].slice(0, 40),
    });
  }, []);

  const session = store.users.find((user) => user.email === store.sessionEmail) ?? null;
  const user = useMemo(() => (session ? toPublic(session) : null), [session]);
  const requests = useMemo(
    () => (user ? store.requests.filter((item) => item.email === user.email) : []),
    [store.requests, user],
  );

  const value = useMemo<AccountContextValue>(
    () => ({ user, requests, register, login, logout, updateProfile, addRequest }),
    [user, requests, register, login, logout, updateProfile, addRequest],
  );

  return <AccountContext.Provider value={value}>{children}</AccountContext.Provider>;
}

export function useAccount() {
  const value = useContext(AccountContext);
  if (!value) throw new Error("useAccount buiten AccountProvider");
  return value;
}

export function useLeadDefaults() {
  const { user } = useAccount();
  return {
    name: user?.name ?? "",
    email: user?.email ?? "",
    phone: user?.phone ?? "",
  };
}
