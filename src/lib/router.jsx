/**
 * Minimal client-side router (no external dependencies).
 * Supports: BrowserRouter, Routes, Route, Outlet, Link, NavLink,
 *           Navigate, useNavigate, useParams, useLocation.
 */
import React, { createContext, useContext, useState, useEffect, useCallback, } from 'react';
const RouterCtx = createContext({ path: '/', navigate: () => { } });
const ParamsCtx = createContext({ params: {} });
const OutletCtx = createContext(null);
// ─── BrowserRouter ───────────────────────────────────────────────────────────
export function BrowserRouter({ children }) {
    const [path, setPath] = useState(() => window.location.pathname || '/');
    const navigate = useCallback((to, opts) => {
        const p = to.split('?')[0];
        if (opts?.replace)
            window.history.replaceState(null, '', to);
        else
            window.history.pushState(null, '', to);
        setPath(p);
    }, []);
    useEffect(() => {
        const sync = () => setPath(window.location.pathname || '/');
        window.addEventListener('popstate', sync);
        return () => window.removeEventListener('popstate', sync);
    }, []);
    return <RouterCtx.Provider value={{ path, navigate }}>{children}</RouterCtx.Provider>;
}
// ─── Route matching ──────────────────────────────────────────────────────────
function segmentsOf(s) { return s.split('/').filter(Boolean); }
/** Returns param map if pattern matches url, else null.
 *  pattern ending with '/*' matches any suffix. */
function matchPath(pattern, url) {
    const prefix = pattern.endsWith('/*');
    const pat = prefix ? pattern.slice(0, -2) : pattern;
    const ps = segmentsOf(pat);
    const us = segmentsOf(url);
    if (!prefix && ps.length !== us.length)
        return null;
    if (prefix && us.length < ps.length)
        return null;
    const params = {};
    for (let i = 0; i < ps.length; i++) {
        if (ps[i].startsWith(':'))
            params[ps[i].slice(1)] = us[i];
        else if (ps[i] !== us[i])
            return null;
    }
    return params;
}
/* eslint-disable react-refresh/only-export-components */
/** Declarative route — rendered only by Routes/RouteMatcher */
export function Route() { return null; }
function gatherRoutes(children) {
    const out = [];
    React.Children.forEach(children, child => {
        if (!React.isValidElement(child))
            return;
        const p = child.props;
        out.push({ path: p.path, element: p.element, children: p.children });
    });
    return out;
}
function joinBase(base, seg) {
    if (!seg)
        return base;
    const b = base.endsWith('/') ? base.slice(0, -1) : base;
    const s = seg.startsWith('/') ? seg : `/${seg}`;
    return b + s;
}
/** Recursively tries to match the current URL against a list of <Route> children.
 *  Returns the React tree to render, or null if nothing matched. */
function resolve(url, routes, base) {
    for (const r of routes) {
        // ── layout route (no path, just wraps children) ──
        if (r.path === undefined) {
            const inner = r.children ? resolve(url, gatherRoutes(r.children), base) : null;
            if (inner === null)
                continue;
            if (!r.element)
                return inner;
            return (<OutletCtx.Provider value={inner}>
          {r.element}
        </OutletCtx.Provider>);
        }
        const full = joinBase(base, r.path);
        // ── leaf route ──
        if (!r.children) {
            const params = matchPath(full, url);
            if (params === null)
                continue;
            return (<ParamsCtx.Provider value={{ params }}>
          {r.element ?? null}
        </ParamsCtx.Provider>);
        }
        // ── parent route (has both element and children) ──
        const params = matchPath(full + '/*', url);
        if (params === null)
            continue;
        const inner = resolve(url, gatherRoutes(r.children), full);
        return (<ParamsCtx.Provider value={{ params }}>
        <OutletCtx.Provider value={inner}>
          {r.element ?? inner}
        </OutletCtx.Provider>
      </ParamsCtx.Provider>);
    }
    return null;
}
export function Routes({ children }) {
    const { path } = useContext(RouterCtx);
    const routes = gatherRoutes(children);
    return <>{resolve(path, routes, '')}</>;
}
// ─── Outlet ──────────────────────────────────────────────────────────────────
export function Outlet() {
    return <>{useContext(OutletCtx)}</>;
}
// ─── Navigate ────────────────────────────────────────────────────────────────
export function Navigate({ to, replace }) {
    const { navigate } = useContext(RouterCtx);
    useEffect(() => { navigate(to, { replace: replace ?? true }); }, []); // eslint-disable-line
    return null;
}
export function Link({ to, children, onClick, ...rest }) {
    const { navigate } = useContext(RouterCtx);
    return (<a href={to} onClick={e => { e.preventDefault(); onClick?.(e); navigate(to); }} {...rest}>
      {children}
    </a>);
}
export function NavLink({ to, children, className, end, onClick, ...rest }) {
    const { path, navigate } = useContext(RouterCtx);
    const isActive = end ? path === to : path === to || path.startsWith(to + '/');
    const cls = typeof className === 'function' ? className({ isActive }) : className;
    return (<a href={to} className={cls} onClick={e => { e.preventDefault(); onClick?.(e); navigate(to); }} {...rest}>
      {children}
    </a>);
}
// ─── Hooks ───────────────────────────────────────────────────────────────────
export function useNavigate() { return useContext(RouterCtx).navigate; }
export function useParams() { return useContext(ParamsCtx).params; }
export function useLocation() {
    const { path } = useContext(RouterCtx);
    return { pathname: path };
}
