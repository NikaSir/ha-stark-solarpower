(() => {
const Panel = customElements.get("stark-solarpower-panel");
const UI_VERSION = "0.6.5";
const MIN_SCALE = 0.75;
const MAX_SCALE = 2;
const SNAP_MIN = 0.97;
const SNAP_MAX = 1.03;
const PAN_THRESHOLD = 7;
const TAP_MOVE = 12;
const TAP_DURATION = 260;
const DOUBLE_TAP_DELAY = 360;
const GUARD_MS = 700;

const clampScale = (value) => Math.min(MAX_SCALE, Math.max(MIN_SCALE, Number(value) || 1));
const distance = (a, b) => Math.hypot(b.clientX - a.clientX, b.clientY - a.clientY);
const midpoint = (a, b, viewport) => {
  const rect = viewport.getBoundingClientRect();
  return { x:(a.clientX + b.clientX) / 2 - rect.left, y:(a.clientY + b.clientY) / 2 - rect.top };
};
const pageMidpoint = (a, b) => ({ x:(a.clientX + b.clientX) / 2, y:(a.clientY + b.clientY) / 2 });
const pointDistance = (a, b) => Math.hypot(b.x - a.x, b.y - a.y);

function cancelHold(target) {
  const entity = target?.closest?.("[data-entity]");
  if (!entity) return;
  const event = typeof PointerEvent === "function"
    ? new PointerEvent("pointercancel", { bubbles:true, composed:true })
    : new Event("pointercancel", { bubbles:true, composed:true });
  entity.dispatchEvent(event);
}

if (Panel && !Panel.prototype.__starkUiV065) {
  Panel.prototype.__starkUiV065 = true;
  const previousRender = Panel.prototype._render;

  Panel.prototype._stateKeyV065 = function () {
    return this._selectedUpsId?.() || this._diagnosticDeviceId || this._devices?.[0]?.id || "default";
  };

  Panel.prototype._loadStateV065 = function (key) {
    this.__starkStatesV065 ||= new Map();
    const memory = this.__starkStatesV065.get(key);
    if (memory) return { ...memory };
    let state = { scale:1, x:0, y:0 };
    try {
      const saved = JSON.parse(localStorage.getItem(`nikas:specialized-panel:stark-solarpower:transform:${key}`) || "null");
      if (saved && typeof saved === "object") {
        state = {
          scale:clampScale(saved.scale),
          x:Number.isFinite(saved.x) ? saved.x : 0,
          y:Number.isFinite(saved.y) ? saved.y : 0,
        };
      } else {
        state.scale = clampScale(localStorage.getItem(`nikas:specialized-panel:stark-solarpower:zoom:${key}`) || 1);
      }
    } catch (_error) { state = { scale:1, x:0, y:0 }; }
    if (state.scale <= 1) { state.x = 0; state.y = 0; }
    return state;
  };

  Panel.prototype._saveStateV065 = function (key, state) {
    this.__starkStatesV065 ||= new Map();
    this.__starkStatesV065.set(key, { scale:state.scale, x:state.x, y:state.y });
    try {
      localStorage.setItem(`nikas:specialized-panel:stark-solarpower:zoom:${key}`, state.scale.toFixed(3));
      localStorage.setItem(`nikas:specialized-panel:stark-solarpower:transform:${key}`, JSON.stringify({
        scale:state.scale,
        x:state.scale > 1 ? state.x : 0,
        y:state.scale > 1 ? state.y : 0,
      }));
    }
    catch (_error) { /* private WebView */ }
  };

  Panel.prototype._installStandardCanvasV065 = function (source) {
    const root = this.shadowRoot;
    const oldStage = source?.querySelector(":scope > .zoom-stage-v060, :scope > .zoom-stage-v057");
    const surface = oldStage?.querySelector(":scope > .zoom-content-v057");
    if (!root || !source || !oldStage || !surface) return;

    this.__starkCanvasResizeObserverV060?.disconnect();
    this.__starkCanvasResizeCleanupV060?.();
    this.__starkResizeObserverV065?.disconnect();
    this.__starkResizeCleanupV065?.();

    const viewport = source.cloneNode(false);
    viewport.className = "zoom-viewport-v065";
    viewport.setAttribute("aria-label", "Рабочая область Stark SolarPower");
    const stage = document.createElement("div");
    stage.className = "zoom-stage-v065";
    surface.className = "zoom-surface-v065";
    stage.append(surface);
    viewport.append(stage);
    source.replaceWith(viewport);

    let key = this._stateKeyV065();
    viewport.dataset.stateKeyV065 = key;
    const state = this._loadStateV065(key);
    // Keep the last real width inherited from the previous canvas layer.
    // On iOS a freshly replaced element can report clientWidth=0 for one
    // frame; overwriting the surface with 1px makes the whole panel vanish.
    let baseWidth = Math.max(1, Number.parseFloat(surface.style.width) || 0);
    let baseHeight = Math.max(1, surface.scrollHeight || 0);
    let pinch = null;
    let pan = null;
    let twoTap = null;
    let multi = false;

    const measure = () => {
      const directWidth = Math.max(
        viewport.clientWidth || 0,
        viewport.getBoundingClientRect().width || 0,
      );
      const selector = root.querySelector(".global-device-context");
      const selectorWidth = Math.max(
        selector?.clientWidth || 0,
        selector?.getBoundingClientRect().width || 0,
      );
      const hostWidth = Math.max(
        root.host?.clientWidth || 0,
        root.host?.getBoundingClientRect().width || 0,
      );
      const measuredWidth = directWidth > 1
        ? directWidth
        : selectorWidth > 1
          ? selectorWidth
          : hostWidth;
      if (measuredWidth > 1) baseWidth = measuredWidth;
      if (baseWidth > 1) surface.style.width = `${baseWidth}px`;
      const rendered = surface.getBoundingClientRect().height / Math.max(state.scale, .01);
      baseHeight = Math.max(1, surface.scrollHeight, Number.isFinite(rendered) ? rendered : 0);
    };
    const bounds = () => ({
      minX:Math.min(0, viewport.clientWidth - baseWidth * state.scale),
      minY:Math.min(0, viewport.clientHeight - baseHeight * state.scale),
      overflowX:baseWidth * state.scale > viewport.clientWidth + .5,
      overflowY:baseHeight * state.scale > viewport.clientHeight + .5,
    });
    const clampPosition = () => {
      if (state.scale <= 1) { state.x = 0; state.y = 0; return; }
      const b = bounds();
      state.x = b.overflowX ? Math.min(0, Math.max(b.minX, state.x)) : 0;
      state.y = b.overflowY ? Math.min(0, Math.max(b.minY, state.y)) : 0;
    };
    const apply = ({ remeasure=false, persist=false } = {}) => {
      if (remeasure) measure();
      clampPosition();
      const native = state.scale <= 1;
      if (viewport.classList.contains("native-scroll") !== native) {
        viewport.classList.toggle("native-scroll", native);
        viewport.classList.toggle("zoomed", !native);
      }
      const stageWidth = `${Math.max(viewport.clientWidth, baseWidth * state.scale)}px`;
      const stageHeight = `${Math.max(viewport.clientHeight, baseHeight * state.scale)}px`;
      const transform = native
        ? `scale(${state.scale})`
        : `translate3d(${state.x}px,${state.y}px,0) scale(${state.scale})`;
      if (stage.style.width !== stageWidth) stage.style.width = stageWidth;
      if (stage.style.height !== stageHeight) stage.style.height = stageHeight;
      if (surface.style.transform !== transform) surface.style.transform = transform;
      if (!native) {
        if (viewport.scrollLeft) viewport.scrollLeft = 0;
        if (viewport.scrollTop) viewport.scrollTop = 0;
      }
      this.__starkZoomV054 = state.scale;
      if (persist) this._saveStateV065(key, state);
    };
    const showToast = () => {
      let toast = viewport.querySelector(":scope > .zoom-toast-v065");
      if (!toast) {
        toast = document.createElement("div");
        toast.className = "zoom-toast-v065";
        toast.setAttribute("role", "status");
        toast.textContent = "Масштаб 100%";
        viewport.append(toast);
      }
      clearTimeout(this.__starkToastTimerV065);
      requestAnimationFrame(() => toast.classList.add("visible"));
      this.__starkToastTimerV065 = setTimeout(() => toast.classList.remove("visible"), 1250);
    };
    const reset = (notify=true) => {
      state.scale = 1; state.x = 0; state.y = 0;
      viewport.scrollTo({ left:0, top:0, behavior:"auto" });
      apply({ persist:true });
      if (notify) showToast();
    };
    const resetPosition = ({ persist=true } = {}) => {
      state.x = 0; state.y = 0;
      viewport.scrollTo({ left:0, top:0, behavior:"auto" });
      apply({ remeasure:true, persist });
    };
    const switchContext = (nextKey) => {
      const normalized = nextKey || "default";
      if (normalized === key) {
        resetPosition({ persist:true });
        return;
      }
      this._saveStateV065(key, state);
      key = normalized;
      viewport.dataset.stateKeyV065 = key;
      const next = this._loadStateV065(key);
      state.scale = next.scale;
      state.x = next.x;
      state.y = next.y;
      viewport.scrollTo({ left:0, top:0, behavior:"auto" });
      apply({ remeasure:true, persist:true });
    };
    const contentPoint = (focal) => state.scale <= 1
      ? { x:focal.x / state.scale, y:(viewport.scrollTop + focal.y) / state.scale }
      : { x:(focal.x - state.x) / state.scale, y:(focal.y - state.y) / state.scale };
    const setAround = (next, focal, anchor) => {
      state.scale = clampScale(next);
      if (state.scale > 1) {
        state.x = focal.x - anchor.x * state.scale;
        state.y = focal.y - anchor.y * state.scale;
        apply();
      } else {
        state.x = 0; state.y = 0;
        apply();
        viewport.scrollLeft = 0;
        viewport.scrollTop = Math.max(0, anchor.y * state.scale - focal.y);
      }
    };

    surface.style.zoom = "";
    surface.style.left = "0";
    surface.style.transformOrigin = "0 0";
    measure();
    apply();

    viewport.addEventListener("touchstart", (event) => {
      if (event.touches.length >= 2) {
        const [a,b] = event.touches;
        const focal = midpoint(a,b,viewport);
        multi = true; pan = null;
        pinch = { distance:Math.max(1,distance(a,b)), scale:state.scale, anchor:contentPoint(focal), startedAt:performance.now(), midpoint:pageMidpoint(a,b), moved:false };
        this.__starkGuardUntilV065 = Infinity;
        Array.from(event.touches).forEach((touch) => cancelHold(root.elementFromPoint?.(touch.clientX,touch.clientY) || document.elementFromPoint(touch.clientX,touch.clientY)));
        event.preventDefault();
      } else if (event.touches.length === 1 && state.scale > 1 && !multi) {
        const touch = event.touches[0];
        pan = { clientX:touch.clientX, clientY:touch.clientY, x:state.x, y:state.y, target:event.target, moved:false };
      }
    }, { passive:false });

    viewport.addEventListener("touchmove", (event) => {
      if (event.touches.length >= 2 && pinch) {
        const [a,b] = event.touches;
        const focal = midpoint(a,b,viewport);
        const currentDistance = distance(a,b);
        setAround(pinch.scale * currentDistance / pinch.distance, focal, pinch.anchor);
        if (pointDistance(pinch.midpoint,pageMidpoint(a,b)) > TAP_MOVE || Math.abs(currentDistance-pinch.distance) > TAP_MOVE) pinch.moved = true;
        event.preventDefault();
        return;
      }
      if (!pan || event.touches.length !== 1 || state.scale <= 1) return;
      const touch = event.touches[0];
      const dx = touch.clientX-pan.clientX, dy = touch.clientY-pan.clientY;
      if (!pan.moved && Math.hypot(dx,dy) < PAN_THRESHOLD) return;
      if (!pan.moved) { pan.moved=true; this.__starkGuardUntilV065=Infinity; cancelHold(pan.target); }
      const b = bounds();
      if (b.overflowX) state.x = pan.x + dx;
      if (b.overflowY) state.y = pan.y + dy;
      apply();
      event.preventDefault();
    }, { passive:false });

    viewport.addEventListener("touchend", (event) => {
      // Keep the original two-finger gesture until the second finger leaves.
      // Clearing `pinch` on the first lift made a two-finger tap impossible to
      // complete and therefore broke the two-finger double-tap reset.
      if (multi && event.touches.length === 1) {
        pan=null;
        event.preventDefault();
        return;
      }
      if (event.touches.length) return;
      const completed = pinch;
      const wasMulti = multi;
      const moved = Boolean(pan?.moved);
      pinch=null; pan=null; multi=false;
      if (state.scale >= SNAP_MIN && state.scale <= SNAP_MAX && state.scale !== 1) {
        state.scale=1; state.x=0; state.y=0; apply({persist:true}); showToast();
      } else apply({persist:true});
      const now=performance.now();
      if (wasMulti) {
        event.preventDefault();
        this.__starkGuardUntilV065=now+GUARD_MS;
        const isTap=completed && !completed.moved && now-completed.startedAt<=TAP_DURATION;
        if (isTap) {
          if (twoTap && now-twoTap.at<=DOUBLE_TAP_DELAY && pointDistance(twoTap.midpoint,completed.midpoint)<=48) { twoTap=null; reset(true); }
          else twoTap={at:now,midpoint:completed.midpoint};
        } else twoTap=null;
      } else if (moved) this.__starkGuardUntilV065=now+GUARD_MS;
    }, { passive:false });
    viewport.addEventListener("touchcancel", () => { pinch=null;pan=null;multi=false;apply({persist:true});this.__starkGuardUntilV065=performance.now()+GUARD_MS; }, { passive:true });
    viewport.addEventListener("click", (event) => {
      if (this.__starkGuardUntilV065===Infinity || performance.now()<Number(this.__starkGuardUntilV065||0)) { event.preventDefault();event.stopImmediatePropagation(); }
    }, { capture:true });

    root.querySelectorAll(".bottom-nav-v051 [data-view-v051]").forEach((button) => button.addEventListener("click", (event) => {
      if (this.__starkGuardUntilV065===Infinity || performance.now()<Number(this.__starkGuardUntilV065||0)) {
        event.preventDefault();
        event.stopImmediatePropagation();
        return;
      }
      state.x=0;state.y=0;viewport.scrollTo({left:0,top:0,behavior:"auto"});this._saveStateV065(key,state);
    }, { capture:true }));

    const resize = () => requestAnimationFrame(() => apply({remeasure:true}));
    if (typeof ResizeObserver === "function") { this.__starkResizeObserverV065=new ResizeObserver(resize);this.__starkResizeObserverV065.observe(surface); }
    window.addEventListener("resize",resize,{passive:true});
    window.visualViewport?.addEventListener("resize",resize,{passive:true});
    this.__starkResizeCleanupV065=()=>{window.removeEventListener("resize",resize);window.visualViewport?.removeEventListener("resize",resize);};
    this.__starkCanvasControllerV065={
      viewport,
      surface,
      state,
      refresh:()=>apply({remeasure:true}),
      resetPosition,
      switchContext,
      reset,
    };
    requestAnimationFrame(() => apply({remeasure:true}));
  };

  Panel.prototype._render = function () {
    previousRender.call(this);
    const root=this.shadowRoot;
    if (!root) return;
    const subtitle=root.querySelector(".subtitle");
    if (subtitle) subtitle.textContent=`UPS Control Center · UI v${UI_VERSION}`;
    const viewport=root.querySelector(".zoom-viewport-v060,.zoom-viewport-v057");
    if (viewport) this._installStandardCanvasV065(viewport);
    if (!root.querySelector("style[data-stark-ui-v065]")) {
      const style=document.createElement("style");
      style.dataset.starkUiV065="true";
      style.textContent=`
        .app-header{display:grid!important;grid-template-columns:52px minmax(0,1fr) 52px!important;align-items:center!important;min-height:62px!important;gap:0!important;margin:0 0 8px!important;padding:0!important}
        .app-header .title-wrap{grid-column:2!important;justify-self:center!important;text-align:center!important;min-width:0!important}.app-header .title-icon{display:none!important}
        .app-header h1{font-size:21px!important;font-weight:800!important}.app-header .subtitle{font-size:12px!important;font-weight:560!important;color:var(--secondary-text-color)!important}
        .app-header .system-menu-v056,.app-header .refresh{width:44px!important;min-width:44px!important;height:44px!important;min-height:44px!important;border-radius:16px!important;border:1px solid var(--divider-color)!important;background:var(--card-background-color)!important;box-shadow:var(--ha-card-box-shadow,0 2px 8px rgba(0,0,0,.12))!important;padding:0!important;display:grid!important;place-items:center!important}
        .app-header .system-menu-v056{grid-column:1!important;grid-row:1!important;justify-self:start!important;color:var(--primary-text-color)!important}.app-header .refresh{grid-column:3!important;grid-row:1!important;justify-self:end!important;color:var(--primary-color)!important}
        .app-header .system-menu-v056 ha-icon,.app-header .refresh ha-icon{--mdc-icon-size:25px!important}
        .tabs.bottom-nav-v051{position:fixed!important;left:0!important;right:0!important;bottom:0!important;width:100%!important;margin:0!important;padding:4px max(4px,env(safe-area-inset-right,0px)) calc(4px + env(safe-area-inset-bottom,0px)) max(4px,env(safe-area-inset-left,0px))!important;border-radius:0!important;border-top:1px solid var(--divider-color)!important;background:var(--card-background-color)!important;box-shadow:0 -3px 14px rgba(0,0,0,.08)!important;z-index:30!important}
        .bottom-nav-v051 .tab{min-height:52px!important;height:auto!important;border-radius:14px!important;font-size:12px!important;font-weight:700!important;color:var(--secondary-text-color)!important;background:transparent!important;box-shadow:none!important}
        .bottom-nav-v051 .tab ha-icon{--mdc-icon-size:28px!important}.bottom-nav-v051 .tab span{font-size:12px!important;font-weight:700!important;white-space:nowrap!important}
        .bottom-nav-v051 .tab.active{color:var(--primary-color)!important;background:color-mix(in srgb,var(--primary-color) 11%,transparent)!important;box-shadow:none!important}
        .zoom-viewport-v065{position:relative;min-width:0;min-height:0;overscroll-behavior:contain;-webkit-overflow-scrolling:touch}.zoom-viewport-v065.native-scroll{overflow-x:hidden!important;overflow-y:auto!important;touch-action:pan-y!important}.zoom-viewport-v065.zoomed{overflow:hidden!important;touch-action:none!important}
        .zoom-stage-v065{position:relative;min-width:100%;min-height:100%;overflow:visible}.zoom-surface-v065{position:absolute;left:0;top:0;transform-origin:0 0;will-change:transform}
        .zoom-toast-v065{position:fixed;left:50%;bottom:calc(76px + env(safe-area-inset-bottom,0px));transform:translate(-50%,8px);opacity:0;pointer-events:none;padding:8px 13px;border-radius:999px;background:rgba(20,24,31,.88);color:#fff;font-size:12px;font-weight:700;transition:.18s;z-index:50}.zoom-toast-v065.visible{opacity:1;transform:translate(-50%,0)}
        @media(max-width:390px){.app-header{grid-template-columns:48px minmax(0,1fr) 48px!important;min-height:60px!important}}
      `;
      root.append(style);
    }
  };
}
})();
