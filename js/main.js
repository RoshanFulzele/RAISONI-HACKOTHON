/* ============================================================
   MAIN JS - Multilingual Citizen Complaint & Governance CRM
   ============================================================ */

'use strict';

// ===================== Page Loader =====================
window.addEventListener('load', () => {
  const loader = document.querySelector('.loader-overlay');
  if (loader) {
    setTimeout(() => {
      loader.classList.add('hidden');
    }, 600);
  }
});

// ===================== Navbar Scroll Behavior =====================
function initNavbar() {
  const navbar = document.querySelector('.navbar');
  if (!navbar) return;

  const handleScroll = () => {
    if (window.scrollY > 60) {
      navbar.classList.add('scrolled');
    } else {
      navbar.classList.remove('scrolled');
    }
  };

  window.addEventListener('scroll', handleScroll, { passive: true });
  handleScroll();

  // Mobile toggle
  const toggle = document.querySelector('.nav-toggle');
  const navLinks = document.querySelector('.nav-links');
  if (toggle && navLinks) {
    toggle.addEventListener('click', () => {
      navLinks.classList.toggle('open');
      toggle.classList.toggle('active');
    });
  }

  // Active nav link
  const currentPath = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(link => {
    const href = link.getAttribute('href');
    if (href === currentPath || (currentPath === '' && href === 'index.html')) {
      link.classList.add('active');
    }
  });
}

// ===================== Scroll Reveal Animation =====================
function initScrollReveal() {
  const revealEls = document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale');
  if (!revealEls.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach((entry, index) => {
      if (entry.isIntersecting) {
        const delay = entry.target.dataset.delay || index * 100;
        setTimeout(() => {
          entry.target.classList.add('revealed');
        }, delay);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -50px 0px' });

  revealEls.forEach(el => observer.observe(el));
}

// ===================== Particle Canvas =====================
function initParticles() {
  const canvas = document.getElementById('particles-canvas');
  if (!canvas) return;

  const ctx = canvas.getContext('2d');
  let width, height, particles;

  function resize() {
    width = canvas.width = canvas.offsetWidth;
    height = canvas.height = canvas.offsetHeight;
  }

  function createParticles() {
    particles = [];
    const count = Math.min(Math.floor(width / 12), 100);
    for (let i = 0; i < count; i++) {
      particles.push({
        x: Math.random() * width,
        y: Math.random() * height,
        vx: (Math.random() - 0.5) * 0.4,
        vy: (Math.random() - 0.5) * 0.4,
        radius: Math.random() * 1.5 + 0.5,
        opacity: Math.random() * 0.5 + 0.2,
        color: Math.random() > 0.5 ? '0,212,255' : '139,92,246'
      });
    }
  }

  function connectParticles() {
    for (let i = 0; i < particles.length; i++) {
      for (let j = i + 1; j < particles.length; j++) {
        const dx = particles[i].x - particles[j].x;
        const dy = particles[i].y - particles[j].y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 120) {
          ctx.beginPath();
          ctx.strokeStyle = `rgba(0,212,255,${(1 - dist / 120) * 0.1})`;
          ctx.lineWidth = 0.5;
          ctx.moveTo(particles[i].x, particles[i].y);
          ctx.lineTo(particles[j].x, particles[j].y);
          ctx.stroke();
        }
      }
    }
  }

  function animate() {
    ctx.clearRect(0, 0, width, height);
    particles.forEach(p => {
      p.x += p.vx;
      p.y += p.vy;
      if (p.x < 0 || p.x > width) p.vx *= -1;
      if (p.y < 0 || p.y > height) p.vy *= -1;

      ctx.beginPath();
      ctx.arc(p.x, p.y, p.radius, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(${p.color},${p.opacity})`;
      ctx.fill();
    });
    connectParticles();
    requestAnimationFrame(animate);
  }

  resize();
  createParticles();
  animate();

  window.addEventListener('resize', () => {
    resize();
    createParticles();
  });

  // Mouse interaction
  canvas.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    const mx = e.clientX - rect.left;
    const my = e.clientY - rect.top;
    particles.forEach(p => {
      const dx = p.x - mx;
      const dy = p.y - my;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist < 80) {
        p.vx += dx / dist * 0.3;
        p.vy += dy / dist * 0.3;
        const maxSpeed = 2;
        const speed = Math.sqrt(p.vx * p.vx + p.vy * p.vy);
        if (speed > maxSpeed) {
          p.vx = (p.vx / speed) * maxSpeed;
          p.vy = (p.vy / speed) * maxSpeed;
        }
      }
    });
  });
}

// ===================== Counter Animation =====================
function animateCounter(el) {
  const target = parseFloat(el.dataset.target || el.textContent.replace(/[^0-9.]/g, ''));
  const suffix = el.dataset.suffix || '';
  const prefix = el.dataset.prefix || '';
  const duration = 1800;
  const start = performance.now();
  const isDecimal = String(target).includes('.');

  function update(now) {
    const elapsed = now - start;
    const progress = Math.min(elapsed / duration, 1);
    const eased = 1 - Math.pow(1 - progress, 3);
    const current = isDecimal ? (target * eased).toFixed(1) : Math.floor(target * eased);
    el.textContent = prefix + current.toLocaleString() + suffix;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

function initCounters() {
  const counters = document.querySelectorAll('.counter');
  if (!counters.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counters.forEach(counter => observer.observe(counter));
}

// ===================== Progress Bar Animation =====================
function initProgressBars() {
  const bars = document.querySelectorAll('.progress-bar[data-width]');
  if (!bars.length) return;

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.style.width = entry.target.dataset.width;
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  bars.forEach(bar => {
    bar.style.width = '0%';
    observer.observe(bar);
  });
}

// ===================== Toast Notifications =====================
const Toast = {
  container: null,

  init() {
    this.container = document.querySelector('.toast-container');
    if (!this.container) {
      this.container = document.createElement('div');
      this.container.className = 'toast-container';
      document.body.appendChild(this.container);
    }
  },

  show(message, type = 'info', duration = 4000) {
    if (!this.container) this.init();

    const icons = { success: '✅', error: '❌', warning: '⚠️', info: 'ℹ️' };
    const toast = document.createElement('div');
    toast.className = `toast ${type}`;
    toast.innerHTML = `
      <span style="font-size:1.1rem">${icons[type]}</span>
      <div style="flex:1">
        <div style="font-size:0.875rem;font-weight:600;color:#f8fafc;margin-bottom:2px">${type.charAt(0).toUpperCase() + type.slice(1)}</div>
        <div style="font-size:0.8rem;color:#94a3b8">${message}</div>
      </div>
      <button onclick="this.parentElement.remove()" style="background:none;border:none;color:#64748b;font-size:1rem;cursor:pointer;padding:0;margin-left:0.5rem">✕</button>
    `;
    this.container.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateX(100%)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, duration);
  },

  success(msg, dur) { this.show(msg, 'success', dur); },
  error(msg, dur) { this.show(msg, 'error', dur); },
  warning(msg, dur) { this.show(msg, 'warning', dur); },
  info(msg, dur) { this.show(msg, 'info', dur); }
};

// ===================== Ripple Effect =====================
function initRipple() {
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.btn, .ripple-container');
    if (!btn) return;

    const rect = btn.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = e.clientX - rect.left - size / 2;
    const y = e.clientY - rect.top - size / 2;

    const ripple = document.createElement('span');
    ripple.className = 'ripple-effect';
    ripple.style.cssText = `width:${size}px;height:${size}px;left:${x}px;top:${y}px;`;

    btn.classList.add('ripple-container');
    btn.appendChild(ripple);
    setTimeout(() => ripple.remove(), 600);
  });
}

// ===================== Smooth Scroll =====================
function initSmoothScroll() {
  document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function(e) {
      const target = document.querySelector(this.getAttribute('href'));
      if (!target) return;
      e.preventDefault();
      const offset = target.getBoundingClientRect().top + window.scrollY - 80;
      window.scrollTo({ top: offset, behavior: 'smooth' });
    });
  });
}

// ===================== Tab System =====================
function initTabs() {
  document.querySelectorAll('[data-tab-group]').forEach(group => {
    const tabGroup = group.dataset.tabGroup;
    const tabs = group.querySelectorAll('[data-tab]');
    const panels = document.querySelectorAll(`[data-tab-panel="${tabGroup}"] [data-panel]`);

    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        const target = tab.dataset.tab;
        panels.forEach(panel => {
          panel.classList.toggle('active', panel.dataset.panel === target);
        });
      });
    });
  });
}

// ===================== Modal System =====================
const Modal = {
  open(id) {
    const modal = document.getElementById(id);
    if (!modal) return;
    modal.style.display = 'flex';
    requestAnimationFrame(() => modal.classList.add('open'));
    document.body.style.overflow = 'hidden';
  },

  close(id) {
    const modal = id ? document.getElementById(id) : document.querySelector('.modal.open');
    if (!modal) return;
    modal.classList.remove('open');
    setTimeout(() => {
      modal.style.display = 'none';
      document.body.style.overflow = '';
    }, 300);
  }
};

// Close modal on backdrop click
document.addEventListener('click', (e) => {
  if (e.target.classList.contains('modal')) Modal.close();
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') Modal.close();
});

// ===================== Typing Effect =====================
function typeWriter(el, text, speed = 50) {
  el.textContent = '';
  let i = 0;
  function type() {
    if (i < text.length) {
      el.textContent += text[i++];
      setTimeout(type, speed);
    }
  }
  type();
}

function initTypingEffect() {
  const typingEls = document.querySelectorAll('[data-typing]');
  typingEls.forEach(el => {
    const texts = el.dataset.typing.split('|');
    let idx = 0;

    function cycleText() {
      el.style.opacity = '0';
      setTimeout(() => {
        el.textContent = texts[idx % texts.length];
        idx++;
        el.style.opacity = '1';
        el.style.transition = 'opacity 0.5s ease';
        setTimeout(cycleText, 3000);
      }, 500);
    }

    cycleText();
  });
}

// ===================== Complaint Tracking Steps =====================
function initTrackingSteps() {
  const steps = document.querySelectorAll('.tracking-step');
  if (!steps.length) return;

  steps.forEach((step, i) => {
    setTimeout(() => {
      step.classList.add('visible');
    }, i * 400);
  });
}

// ===================== Language Switcher =====================
function initLanguageSwitcher() {
  const switchers = document.querySelectorAll('[data-lang-switcher]');
  switchers.forEach(sw => {
    sw.addEventListener('change', (e) => {
      const lang = e.target.value;
      document.documentElement.setAttribute('lang', lang);
      Toast.info(`Language switched to ${lang.toUpperCase()}`);
    });
  });
}

// ===================== File Upload Preview =====================
function initFileUpload() {
  document.querySelectorAll('.file-upload-area').forEach(area => {
    const input = area.querySelector('input[type="file"]');
    const preview = area.querySelector('.file-preview');

    if (input) {
      area.addEventListener('dragover', (e) => {
        e.preventDefault();
        area.classList.add('drag-over');
      });

      area.addEventListener('dragleave', () => area.classList.remove('drag-over'));

      area.addEventListener('drop', (e) => {
        e.preventDefault();
        area.classList.remove('drag-over');
        if (input) input.files = e.dataTransfer.files;
        handleFiles(e.dataTransfer.files, preview);
      });

      input.addEventListener('change', () => handleFiles(input.files, preview));
    }
  });
}

function handleFiles(files, preview) {
  if (!preview || !files.length) return;
  preview.innerHTML = '';
  Array.from(files).forEach(file => {
    if (file.type.startsWith('image/')) {
      const reader = new FileReader();
      reader.onload = (e) => {
        const img = document.createElement('img');
        img.src = e.target.result;
        img.style.cssText = 'width:80px;height:80px;object-fit:cover;border-radius:8px;border:1px solid var(--border-color)';
        preview.appendChild(img);
      };
      reader.readAsDataURL(file);
    } else {
      const span = document.createElement('span');
      span.className = 'badge badge-blue';
      span.textContent = file.name;
      preview.appendChild(span);
    }
  });
}

// ===================== Voice Input (Web Speech API) =====================
function initVoiceInput() {
  const voiceBtns = document.querySelectorAll('[data-voice-input]');
  voiceBtns.forEach(btn => {
    const targetId = btn.dataset.voiceInput;
    const target = document.getElementById(targetId);
    if (!target) return;

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
      btn.title = 'Voice input not supported in this browser';
      btn.style.opacity = '0.5';
      btn.style.cursor = 'not-allowed';
      return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.lang = 'en-IN';

    let isListening = false;

    btn.addEventListener('click', () => {
      if (isListening) {
        recognition.stop();
        return;
      }
      if (location.protocol !== 'https:' && location.hostname !== 'localhost' && location.hostname !== '127.0.0.1') {
        if (typeof Toast !== 'undefined') Toast.error('Voice input requires a secure (HTTPS) connection.');
        else alert('Voice input requires a secure (HTTPS) connection.');
        return;
      }
      try {
        recognition.start();
      } catch (e) {
        if (typeof Toast !== 'undefined') Toast.error('Could not start voice input. Please try again.');
        else alert('Could not start voice input. Please try again.');
      }
    });

    recognition.onstart = () => {
      isListening = true;
      btn.classList.add('listening');
      btn.innerHTML = '🔴 Stop';
      if (typeof Toast !== 'undefined') Toast.info('Listening... Speak your complaint');
    };

    recognition.onresult = (event) => {
      const transcript = Array.from(event.results)
        .map(r => r[0].transcript).join('');
      target.value = target.value ? target.value + ' ' + transcript : transcript;
    };

    recognition.onend = () => {
      isListening = false;
      btn.classList.remove('listening');
      btn.innerHTML = '🎤 Voice';
      if (typeof Toast !== 'undefined') Toast.success('Voice input captured!');
    };

    recognition.onerror = (event) => {
      isListening = false;
      btn.classList.remove('listening');
      btn.innerHTML = '🎤 Voice';
      let msg = 'Voice input failed. Please try again.';
      if (event.error === 'no-speech') msg = 'No speech detected. Please try again.';
      else if (event.error === 'audio-capture') msg = 'No microphone found. Please check your device.';
      else if (event.error === 'not-allowed') msg = 'Microphone access denied. Please allow microphone permission.';
      if (typeof Toast !== 'undefined') Toast.error(msg);
      else alert(msg);
    };
  });
}

// ===================== Sidebar Toggle (Mobile) =====================
function initSidebarToggle() {
  const toggleBtn = document.querySelector('[data-sidebar-toggle]');
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');

  if (toggleBtn && sidebar) {
    toggleBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      if (overlay) overlay.classList.toggle('visible');
    });
  }

  if (overlay) {
    overlay.addEventListener('click', () => {
      sidebar.classList.remove('open');
      overlay.classList.remove('visible');
    });
  }
}

// ===================== Dropdown Menu =====================
function initDropdowns() {
  document.querySelectorAll('[data-dropdown]').forEach(trigger => {
    const menu = document.getElementById(trigger.dataset.dropdown);
    if (!menu) return;

    trigger.addEventListener('click', (e) => {
      e.stopPropagation();
      const isOpen = menu.classList.contains('open');
      document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
      if (!isOpen) menu.classList.add('open');
    });
  });

  document.addEventListener('click', () => {
    document.querySelectorAll('.dropdown-menu.open').forEach(m => m.classList.remove('open'));
  });
}

// ===================== Complaint Form Submission =====================
function initComplaintForm() {
  const form = document.getElementById('complaintForm');
  if (!form) return;

  form.addEventListener('submit', (e) => {
    e.preventDefault();
    const btn = form.querySelector('[type="submit"]');
    const origText = btn.innerHTML;
    btn.innerHTML = '<span class="loader" style="width:18px;height:18px;border-width:2px"></span> Submitting...';
    btn.disabled = true;

    setTimeout(() => {
      btn.innerHTML = origText;
      btn.disabled = false;
      const trackingId = 'CRM' + Date.now().toString().slice(-6);
      Toast.success(`Complaint submitted! Tracking ID: ${trackingId}`);
      
      // Show tracking ID
      const trackingEl = document.getElementById('trackingIdDisplay');
      if (trackingEl) {
        trackingEl.textContent = trackingId;
        trackingEl.closest('.tracking-id-box')?.classList.remove('hidden');
      }
      
      setTimeout(() => {
        if (confirm(`Complaint submitted successfully!\nTracking ID: ${trackingId}\n\nWould you like to track your complaint?`)) {
          window.location.href = `complaint-tracking.html?id=${trackingId}`;
        }
      }, 1000);
    }, 1800);
  });
}

// ===================== Search Functionality =====================
function initSearch() {
  const searchInputs = document.querySelectorAll('[data-search]');
  searchInputs.forEach(input => {
    const targetSelector = input.dataset.search;
    const items = document.querySelectorAll(targetSelector);

    input.addEventListener('input', () => {
      const query = input.value.toLowerCase().trim();
      items.forEach(item => {
        const text = item.textContent.toLowerCase();
        item.style.display = text.includes(query) ? '' : 'none';
      });
    });
  });
}

// ===================== Filter Pills =====================
function initFilterPills() {
  document.querySelectorAll('.filter-pills').forEach(pillGroup => {
    const pills = pillGroup.querySelectorAll('.filter-pill');
    const targetSelector = pillGroup.dataset.filterTarget;

    pills.forEach(pill => {
      pill.addEventListener('click', () => {
        pills.forEach(p => p.classList.remove('active'));
        pill.classList.add('active');

        const filter = pill.dataset.filter;
        if (targetSelector) {
          document.querySelectorAll(targetSelector).forEach(item => {
            if (filter === 'all' || item.dataset.category === filter || item.dataset.status === filter) {
              item.style.display = '';
            } else {
              item.style.display = 'none';
            }
          });
        }
      });
    });
  });
}

// ===================== Accordion =====================
function initAccordion() {
  document.querySelectorAll('.accordion-item').forEach(item => {
    const header = item.querySelector('.accordion-header');
    const content = item.querySelector('.accordion-content');

    if (header && content) {
      header.addEventListener('click', () => {
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.accordion-item.open').forEach(i => {
          i.classList.remove('open');
          i.querySelector('.accordion-content').style.maxHeight = null;
        });
        if (!isOpen) {
          item.classList.add('open');
          content.style.maxHeight = content.scrollHeight + 'px';
        }
      });
    }
  });
}

// ===================== Initialize All =====================
document.addEventListener('DOMContentLoaded', () => {
  initNavbar();
  initScrollReveal();
  initParticles();
  initCounters();
  initProgressBars();
  initRipple();
  initSmoothScroll();
  initTabs();
  initTypingEffect();
  initLanguageSwitcher();
  initFileUpload();
  initVoiceInput();
  initSidebarToggle();
  initDropdowns();
  initComplaintForm();
  initSearch();
  initFilterPills();
  initAccordion();
  Toast.init();

  // Stagger items on page load
  document.querySelectorAll('.stagger').forEach(el => {
    Array.from(el.children).forEach((child, i) => {
      child.style.opacity = '0';
      child.style.transform = 'translateY(20px)';
      setTimeout(() => {
        child.style.transition = 'all 0.5s ease';
        child.style.opacity = '1';
        child.style.transform = 'translateY(0)';
      }, 100 + i * 120);
    });
  });
});

// ===================== Export Utilities =====================
window.CRM = {
  Toast,
  Modal,
  typeWriter,
  animateCounter
};
