// Simple event-based toast (no deps)
let idSeq = 1;

export const toast = {
  show(type, message, opts = {}) {
    const id = idSeq++;
    const detail = { id, type, message, duration: opts.duration ?? 3000 };
    window.dispatchEvent(new CustomEvent('toast:add', { detail }));
    return id;
  },
  success(msg, opts) { return this.show('success', msg, opts); },
  error(msg, opts) { return this.show('error', msg, opts); },
  info(msg, opts) { return this.show('info', msg, opts); },
  close(id) { window.dispatchEvent(new CustomEvent('toast:remove', { detail: { id } })); }
};