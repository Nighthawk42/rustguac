(function() {
    window.CLUSTER_THEMES = {
        'catppuccin-mocha': {
            name: 'Catppuccin Mocha',
            icon: '🌙',
            swatch: '#cba6f7',
            colors: {
                primary: '#b4befe', primary_hover: '#89b4fa',
                accent: '#cba6f7', accent_hover: '#74c7ec',
                bg: '#1e1e2e', surface: '#313244', input: '#181825',
                text: '#cdd6f4', text_muted: '#a6adc8', border: '#45475a',
                text_dim: '#6c7086', text_on_primary: '#1e1e2e', btn_disabled: '#585b70',
                status_pending: '#f9e2af', status_active: '#94e2d5',
                status_completed: '#7f849c', status_error: '#f38ba8', status_expired: '#6c7086',
                type_ssh_bg: 'rgba(166, 227, 161, 0.15)', type_ssh_fg: '#a6e3a1',
                type_rdp_bg: 'rgba(250, 179, 135, 0.15)', type_rdp_fg: '#fab387',
                type_vnc_bg: 'rgba(203, 166, 247, 0.15)', type_vnc_fg: '#cba6f7',
                type_web_bg: 'rgba(137, 180, 250, 0.15)', type_web_fg: '#89b4fa',
                type_vdi_bg: 'rgba(148, 226, 213, 0.15)', type_vdi_fg: '#94e2d5',
                hop_bg: '#313244', hop_fg: '#a6e3a1',
                bg_pattern: 'none'
            }
        },
        'github-dark': {
            name: 'GitHub Dark',
            icon: '🌑',
            swatch: '#58a6ff',
            colors: {
                primary: '#58a6ff', primary_hover: '#79c0ff',
                accent: '#bc8cff', accent_hover: '#d2a8ff',
                bg: '#0d1117', surface: '#161b22', input: '#21262d',
                text: '#e6edf3', text_muted: '#8d96a0', border: '#30363d',
                text_dim: '#6e7681', text_on_primary: '#ffffff', btn_disabled: '#30363d',
                status_pending: '#d29922', status_active: '#3fb950',
                status_completed: '#8b949e', status_error: '#f85149', status_expired: '#6e7681',
                type_ssh_bg: 'rgba(63, 185, 80, 0.15)', type_ssh_fg: '#3fb950',
                type_rdp_bg: 'rgba(219, 109, 40, 0.15)', type_rdp_fg: '#db6d28',
                type_vnc_bg: 'rgba(188, 140, 255, 0.15)', type_vnc_fg: '#bc8cff',
                type_web_bg: 'rgba(88, 166, 255, 0.15)', type_web_fg: '#58a6ff',
                type_vdi_bg: 'rgba(57, 197, 207, 0.15)', type_vdi_fg: '#39c5cf',
                hop_bg: '#161b22', hop_fg: '#3fb950',
                bg_pattern: 'none'
            }
        },
        'github-light': {
            name: 'GitHub Light',
            icon: '☀️',
            swatch: '#0969da',
            colors: {
                primary: '#0969da', primary_hover: '#0550ae',
                accent: '#8250df', accent_hover: '#6639ba',
                bg: '#f6f8fa', surface: '#ffffff', input: '#ffffff',
                text: '#1f2328', text_muted: '#656d76', border: '#d0d7de',
                text_dim: '#8c959f', text_on_primary: '#ffffff', btn_disabled: '#d0d7de',
                status_pending: '#9a6700', status_active: '#1a7f37',
                status_completed: '#656d76', status_error: '#cf222e', status_expired: '#8c959f',
                type_ssh_bg: '#dafbe1', type_ssh_fg: '#1a7f37',
                type_rdp_bg: '#ffebe9', type_rdp_fg: '#bc4c00',
                type_vnc_bg: '#fbefff', type_vnc_fg: '#8250df',
                type_web_bg: '#ddf4ff', type_web_fg: '#0969da',
                type_vdi_bg: '#dafbe1', type_vdi_fg: '#116329',
                hop_bg: '#dafbe1', hop_fg: '#1a7f37',
                bg_pattern: 'none'
            }
        }
    };

    window.FONT_SCALES = {
        'compact':  { label: 'Compact',  size: '14px' },
        'standard': { label: 'Standard', size: '16px' },
        'large':    { label: 'Large',    size: '18px' },
        'xlarge':   { label: 'Extra',    size: '20px' }
    };

    window.applyThemeColors = function(colors) {
        var r = document.documentElement.style;
        for (var k in colors) {
            r.setProperty('--' + k.replace(/_/g, '-'), colors[k]);
        }
        var s = document.getElementById('bg-pattern-style');
        if (!s) {
            s = document.createElement('style');
            s.id = 'bg-pattern-style';
            document.head.appendChild(s);
        }
        s.textContent = colors.bg_pattern && colors.bg_pattern !== 'none'
            ? 'body{background-image:' + colors.bg_pattern + ';background-attachment:fixed}'
            : '';
        localStorage.setItem('rustguac_theme_colors', JSON.stringify(colors));
    };

    window.switchTheme = function(themeKey) {
        if (!window.CLUSTER_THEMES[themeKey]) themeKey = 'catppuccin-mocha';
        localStorage.setItem('rustguac_theme', themeKey);
        window.applyThemeColors(window.CLUSTER_THEMES[themeKey].colors);

        document.querySelectorAll('.cluster-theme-btn').forEach(function(btn) {
            if (btn.getAttribute('data-theme') === themeKey) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
        updateSettingsModalState();
    };

    window.setFontScale = function(scaleKey) {
        if (!window.FONT_SCALES[scaleKey]) scaleKey = 'standard';
        var entry = window.FONT_SCALES[scaleKey];
        localStorage.setItem('rustguac_font_scale', scaleKey);
        document.documentElement.style.setProperty('--base-font-size', entry.size);

        document.querySelectorAll('.font-scale-btn').forEach(function(btn) {
            if (btn.getAttribute('data-scale') === scaleKey) {
                btn.classList.add('active');
            } else {
                btn.classList.remove('active');
            }
        });
    };

    window.renderThemeSwitcher = function(containerId) {
        var container = document.getElementById(containerId);
        if (!container) return;
        var active = localStorage.getItem('rustguac_theme') || 'catppuccin-mocha';
        if (!window.CLUSTER_THEMES[active]) active = 'catppuccin-mocha';

        container.className = 'cluster-theme-switcher';
        container.innerHTML = [
            '<button type="button" class="cluster-theme-btn' + (active === 'catppuccin-mocha' ? ' active' : '') + '" data-theme="catppuccin-mocha" title="Catppuccin Mocha">',
            '  <span class="cluster-theme-swatch" style="background:#cba6f7"></span><span>Mocha</span>',
            '</button>',
            '<button type="button" class="cluster-theme-btn' + (active === 'github-dark' ? ' active' : '') + '" data-theme="github-dark" title="GitHub Dark">',
            '  <span class="cluster-theme-swatch" style="background:#58a6ff"></span><span>GitHub Dark</span>',
            '</button>',
            '<button type="button" class="cluster-theme-btn' + (active === 'github-light' ? ' active' : '') + '" data-theme="github-light" title="GitHub Light">',
            '  <span class="cluster-theme-swatch" style="background:#0969da"></span><span>GitHub Light</span>',
            '</button>'
        ].join('');

        container.querySelectorAll('.cluster-theme-btn').forEach(function(btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                var t = btn.getAttribute('data-theme');
                window.switchTheme(t);
            });
        });
    };

    // ── Settings Modal Component ──
    function ensureSettingsModal() {
        if (document.getElementById('cluster-settings-modal')) return;

        var overlay = document.createElement('div');
        overlay.id = 'cluster-settings-modal';
        overlay.className = 'modal-overlay';
        overlay.innerHTML = [
            '<div class="modal settings-modal-box">',
            '  <div class="settings-modal-header">',
            '    <div style="display:flex; align-items:center; gap:8px;">',
            '      <span style="font-size:20px;">⚙️</span>',
            '      <h3 style="margin:0; border:none; padding:0;">Preferences</h3>',
            '    </div>',
            '    <button type="button" class="btn-small settings-close-btn" id="settings-close-btn" style="border:none; font-size:18px; line-height:1; padding:4px 8px;">&times;</button>',
            '  </div>',
            '  <div class="settings-modal-body">',
            '    <label style="margin-top:0;">Color Theme</label>',
            '    <div class="settings-theme-cards">',
            '      <div class="settings-theme-card" data-theme="catppuccin-mocha">',
            '        <span class="settings-theme-swatch" style="background:linear-gradient(135deg,#cba6f7 50%,#b4befe 50%)"></span>',
            '        <div class="settings-theme-info">',
            '          <strong>Catppuccin Mocha</strong>',
            '          <span>Dark pastel cluster theme</span>',
            '        </div>',
            '      </div>',
            '      <div class="settings-theme-card" data-theme="github-dark">',
            '        <span class="settings-theme-swatch" style="background:linear-gradient(135deg,#58a6ff 50%,#bc8cff 50%)"></span>',
            '        <div class="settings-theme-info">',
            '          <strong>GitHub Dark</strong>',
            '          <span>Deep blue & purple dark</span>',
            '        </div>',
            '      </div>',
            '      <div class="settings-theme-card" data-theme="github-light">',
            '        <span class="settings-theme-swatch" style="background:linear-gradient(135deg,#0969da 50%,#8250df 50%)"></span>',
            '        <div class="settings-theme-info">',
            '          <strong>GitHub Light</strong>',
            '          <span>Clean daylight contrast</span>',
            '        </div>',
            '      </div>',
            '    </div>',
            '    <label style="margin-top:16px;">Font Size</label>',
            '    <div class="segmented-control font-scale-control">',
            '      <button type="button" class="segmented-btn font-scale-btn" data-scale="compact">Compact <small style="opacity:0.7">14px</small></button>',
            '      <button type="button" class="segmented-btn font-scale-btn" data-scale="standard">Standard <small style="opacity:0.7">16px</small></button>',
            '      <button type="button" class="segmented-btn font-scale-btn" data-scale="large">Large <small style="opacity:0.7">18px</small></button>',
            '      <button type="button" class="segmented-btn font-scale-btn" data-scale="xlarge">Extra <small style="opacity:0.7">20px</small></button>',
            '    </div>',
            '    <div id="settings-extra-actions" style="margin-top:20px; padding-top:16px; border-top:1px solid var(--border); display:flex; flex-direction:column; gap:8px;">',
            '      <button type="button" id="settings-my-creds-btn" class="btn-add" style="width:100%; justify-content:flex-start; text-align:left;">🔑 My Credentials</button>',
            '      <button type="button" id="settings-tour-btn" class="btn-add" style="width:100%; justify-content:flex-start; text-align:left;">ℹ️ Welcome Tour</button>',
            '    </div>',
            '  </div>',
            '  <div class="modal-actions" style="margin-top:18px;">',
            '    <button type="button" class="btn-primary" id="settings-done-btn">Done</button>',
            '  </div>',
            '</div>'
        ].join('');

        document.body.appendChild(overlay);

        // Bind events
        overlay.addEventListener('click', function(e) {
            if (e.target === overlay) closeSettingsModal();
        });
        document.getElementById('settings-close-btn').addEventListener('click', closeSettingsModal);
        document.getElementById('settings-done-btn').addEventListener('click', closeSettingsModal);

        overlay.querySelectorAll('.settings-theme-card').forEach(function(card) {
            card.addEventListener('click', function() {
                var t = card.getAttribute('data-theme');
                window.switchTheme(t);
            });
        });

        overlay.querySelectorAll('.font-scale-btn').forEach(function(btn) {
            btn.addEventListener('click', function() {
                var s = btn.getAttribute('data-scale');
                window.setFontScale(s);
            });
        });

        var credsBtn = document.getElementById('settings-my-creds-btn');
        if (credsBtn) {
            credsBtn.addEventListener('click', function() {
                closeSettingsModal();
                var origBtn = document.getElementById('my-creds-item') || document.getElementById('my-creds-nav');
                if (origBtn) origBtn.click();
            });
            if (!document.getElementById('my-creds-modal')) credsBtn.style.display = 'none';
        }

        var tourBtn = document.getElementById('settings-tour-btn');
        if (tourBtn) {
            tourBtn.addEventListener('click', function() {
                closeSettingsModal();
                var origTour = document.getElementById('show-tour-item');
                if (origTour) origTour.click();
            });
            if (!document.getElementById('onboarding-modal')) tourBtn.style.display = 'none';
        }
    }

    function updateSettingsModalState() {
        var modal = document.getElementById('cluster-settings-modal');
        if (!modal) return;
        var activeTheme = localStorage.getItem('rustguac_theme') || 'catppuccin-mocha';
        var activeScale = localStorage.getItem('rustguac_font_scale') || 'standard';

        modal.querySelectorAll('.settings-theme-card').forEach(function(c) {
            if (c.getAttribute('data-theme') === activeTheme) c.classList.add('active');
            else c.classList.remove('active');
        });

        modal.querySelectorAll('.font-scale-btn').forEach(function(b) {
            if (b.getAttribute('data-scale') === activeScale) b.classList.add('active');
            else b.classList.remove('active');
        });
    }

    window.openSettingsModal = function() {
        ensureSettingsModal();
        updateSettingsModalState();
        var modal = document.getElementById('cluster-settings-modal');
        if (modal) modal.classList.add('active');
    };

    window.closeSettingsModal = function() {
        var modal = document.getElementById('cluster-settings-modal');
        if (modal) modal.classList.remove('active');
    };

    // Attach Settings modal to #user-menu-btn or settings triggers
    document.addEventListener('DOMContentLoaded', function() {
        var btn = document.getElementById('user-menu-btn');
        if (btn) {
            btn.addEventListener('click', function(e) {
                e.preventDefault();
                e.stopPropagation();
                window.openSettingsModal();
            });
        }
    });

    // Auto-apply stored font scale immediately on script parse
    var initialScale = localStorage.getItem('rustguac_font_scale') || 'standard';
    if (window.FONT_SCALES[initialScale]) {
        document.documentElement.style.setProperty('--base-font-size', window.FONT_SCALES[initialScale].size);
    }

    // Auto-apply theme colors immediately
    var initialTheme = localStorage.getItem('rustguac_theme') || 'catppuccin-mocha';
    if (window.CLUSTER_THEMES[initialTheme]) {
        window.applyThemeColors(window.CLUSTER_THEMES[initialTheme].colors);
    }
})();
