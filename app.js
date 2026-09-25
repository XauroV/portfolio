(() => {
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;
  const content = window.PORTFOLIO_CONTENT || { about: {}, gallery: [], galleryPreview: [], works: [] };
  const i18n = window.PORTFOLIO_I18N || {};
  let currentLanguage = 'en';
  try { currentLanguage = localStorage.getItem('portfolio-language') === 'zh' ? 'zh' : 'en'; } catch {}

  const projectInLanguage = (project) => {
    const copy = i18n.projects?.[project.name]?.[currentLanguage];
    return copy ? { ...project, ...copy } : project;
  };

  function setupLanguage() {
    const setText = (selector, value) => {
      if (value === undefined) return;
      $$(selector).forEach((node) => { node.textContent = value; });
    };
    const setHtml = (selector, value) => {
      if (value === undefined) return;
      $$(selector).forEach((node) => { node.innerHTML = value; });
    };

    const applyLanguage = () => {
      const shared = i18n.shared?.[currentLanguage] || {};
      const home = i18n.home?.[currentLanguage] || {};
      const about = i18n.about?.[currentLanguage] || {};
      const gallery = i18n.gallery?.[currentLanguage] || {};
      document.documentElement.lang = currentLanguage === 'zh' ? 'zh-CN' : 'en';

      $$('.nav-links').forEach((nav) => {
        const links = $$('a', nav);
        if (links[0]) links[0].textContent = shared.work;
        if (links[1]) links[1].textContent = shared.gallery;
        if (links[2]) links[2].textContent = shared.about;
      });
      setText('.contact-trigger', shared.contact);
      setText('.contact-panel a span', shared.rednote);
      setText('.contact-panel button span', shared.email);
      $$('.language-toggle').forEach((button) => {
        button.textContent = shared.switchLabel;
        button.setAttribute('aria-label', shared.switchAria);
      });

      setText('.hero-copy>p', home.hero);
      setText('.belief>h2', home.beliefTitle);
      setHtml('.belief-copy', home.beliefCopy);
      setText('.meaning>h3', home.meaning);
      setText('.fun>h3', home.fun);
      setText('.works>h2', home.worksTitle);
      setText('.works-intro', home.worksIntro);
      setText('.gallery-preview>h2', home.galleryTitle);
      setText('.visit-gallery', home.visitGallery);
      setText('.case-grid aside>h3', shared.tags);

      $$('.me-intro').forEach((intro) => {
        const title = $('h1', intro);
        const paragraph = $('.me-intro>p', intro);
        const education = $('h2', intro);
        const schools = $$('.school', intro);
        if (title) title.textContent = about.introTitle;
        if (paragraph) paragraph.textContent = about.intro;
        if (education) education.textContent = about.education;
        if (schools[0]) schools[0].innerHTML = about.school1;
        if (schools[1]) schools[1].innerHTML = about.school2;
      });
      setText('#beliefBubbleText', about.beliefs?.[0]);
      const interests = { camera: about.camera, drawing: about.drawing, cat: about.cat, cooking: about.cooking, dance: about.dance, nature: about.nature, computer: about.computer };
      Object.entries(interests).forEach(([key, value]) => {
        $$(`.me-object-${key}`).forEach((node) => { node.dataset.message = value; });
      });
      setText('.zhuhai-copy h2', about.zhuhaiTitle); setHtml('.zhuhai-copy p', about.zhuhai);
      setText('.tools-copy h2', about.toolsTitle); setHtml('.tools-copy p', about.tools);
      setText('.explore-copy h2', about.exploreTitle); setHtml('.explore-copy p', about.explore);
      setText('.cook-copy h2', about.cookTitle); setHtml('.cook-copy p', about.cook);
      setText('.me-footer-copy h2', about.thanks); setText('.me-footer-copy p', about.footer);
      $$('.me-footer-copy a, .me-footer-copy button').forEach((node) => {
        const label = node.matches('a') ? shared.rednote : shared.email;
        if (node.firstChild?.nodeType === Node.TEXT_NODE) node.firstChild.nodeValue = `${label} `;
        else node.prepend(document.createTextNode(`${label} `));
      });
      const footerMeta = $$('.me-footer-meta span');
      if (footerMeta[0]) footerMeta[0].textContent = about.built;
      if (footerMeta[1]) footerMeta[1].textContent = about.updated;

      $$('.gallery-tabs button').forEach((button) => {
        button.dataset.label = gallery[button.dataset.filter] || button.dataset.label;
      });
    };

    $$('.language-toggle').forEach((button) => {
      button.addEventListener('click', () => {
        currentLanguage = currentLanguage === 'en' ? 'zh' : 'en';
        try { localStorage.setItem('portfolio-language', currentLanguage); } catch {}
        applyLanguage();
        dispatchEvent(new CustomEvent('portfolio-languagechange', { detail: { language: currentLanguage } }));
      });
    });
    applyLanguage();
  }

  const wordmark = $('.wordmark');
  if (wordmark?.getAttribute('href') === '#home') wordmark.addEventListener('click', (event) => {
    event.preventDefault();
    const root = document.documentElement;
    const previousScrollBehavior = root.style.scrollBehavior;
    root.style.scrollBehavior = 'auto';
    window.scrollTo(0, 0);
    history.replaceState(null, '', '#home');
    requestAnimationFrame(() => {
      root.style.scrollBehavior = previousScrollBehavior;
    });
  });

  const contactWrap = $('.contact-wrap');
  const contactTrigger = $('#contactTrigger');
  const contactPanel = $('#contactPanel');
  if (contactWrap && contactTrigger && contactPanel) {
    let closeTimer = null;
    const setContact = (open) => {
      contactPanel.classList.toggle('is-open', open);
      contactPanel.setAttribute('aria-hidden', String(!open));
      contactTrigger.setAttribute('aria-expanded', String(open));
    };
    const openContact = () => {
      clearTimeout(closeTimer);
      setContact(true);
    };
    const closeContactSoon = () => {
      clearTimeout(closeTimer);
      closeTimer = setTimeout(() => setContact(false), 240);
    };
    contactWrap.addEventListener('mouseenter', openContact);
    contactWrap.addEventListener('mouseleave', closeContactSoon);
    contactWrap.addEventListener('focusin', openContact);
    contactWrap.addEventListener('focusout', (event) => {
      if (!contactWrap.contains(event.relatedTarget)) closeContactSoon();
    });
    contactTrigger.addEventListener('click', () => {
      clearTimeout(closeTimer);
      setContact(contactTrigger.getAttribute('aria-expanded') !== 'true');
    });
  }

  async function copyAddress(button) {
    if (!button) return;
    const address = button.dataset.email?.trim();
    if (!address) return;
    try {
      await navigator.clipboard.writeText(address);
      button.animate([{ opacity: 1 }, { opacity: .35 }, { opacity: 1 }], { duration: 360 });
    } catch {
      return;
    }
  }
  $('#copyEmail')?.addEventListener('click', (event) => copyAddress(event.currentTarget));
  $('#footerCopyEmail')?.addEventListener('click', (event) => copyAddress(event.currentTarget));

  function setupBeliefMotion() {
    const section = $('#belief');
    const track = $('#meaningTrack');
    const field = $('#funShapes');
    if (!section || !track || !field) return;

    const balls = $$('.track-ball', track);
    const triangles = $$('.track-triangle', track);
    let trackWidth = track.clientWidth || 340;
    let trackHeight = track.clientHeight || 164;
    let terrainSegments = [];
    let ballsAwake = false;

    const refreshTerrain = () => {
      terrainSegments = triangles.flatMap((triangle) => {
        const left = triangle.offsetLeft;
        const top = triangle.offsetTop;
        const width = triangle.offsetWidth;
        const bottom = top + triangle.offsetHeight;
        const peak = { x: left + width / 2, y: top };
        return [
          [{ x: left, y: bottom }, peak],
          [peak, { x: left + width, y: bottom }]
        ];
      });
    };
    refreshTerrain();

    const startingPeaks = [2, 3];
    const ballBodies = balls.map((element, index) => {
      const triangle = triangles[startingPeaks[index] ?? index] || triangles[index] || triangles[0];
      const radius = (element.offsetWidth || 64) / 2;
      const peakX = triangle ? triangle.offsetLeft + triangle.offsetWidth / 2 : radius + index * radius * 2.15;
      const peakY = triangle ? triangle.offsetTop : 82;
      return {
        element,
        x: peakX,
        y: peakY - radius,
        vx: 0,
        vy: 0,
        radius,
        angle: 0
      };
    });

    const renderBalls = () => {
      ballBodies.forEach((ball) => {
        ball.element.style.transform = `translate3d(${ball.x - ball.radius}px,${ball.y - ball.radius}px,0) rotate(${ball.angle}deg)`;
      });
    };
    renderBalls();

    const closestPointOnSegment = (px, py, start, end) => {
      const dx = end.x - start.x;
      const dy = end.y - start.y;
      const lengthSquared = dx * dx + dy * dy || 1;
      const amount = Math.max(0, Math.min(1, ((px - start.x) * dx + (py - start.y) * dy) / lengthSquared));
      return { x: start.x + dx * amount, y: start.y + dy * amount, dx, dy };
    };

    const resolveBallTerrain = (ball) => {
      terrainSegments.forEach(([start, end]) => {
        const closest = closestPointOnSegment(ball.x, ball.y, start, end);
        let dx = ball.x - closest.x;
        let dy = ball.y - closest.y;
        let distance = Math.hypot(dx, dy);
        if (distance >= ball.radius) return;

        let nx;
        let ny;
        if (distance > .001) {
          nx = dx / distance;
          ny = dy / distance;
        } else {
          const segmentLength = Math.hypot(closest.dx, closest.dy) || 1;
          nx = closest.dy / segmentLength;
          ny = -closest.dx / segmentLength;
          if (ny > 0) { nx *= -1; ny *= -1; }
          distance = 0;
        }
        if (ny > .2) return;

        const penetration = ball.radius - distance + .05;
        ball.x += nx * penetration;
        ball.y += ny * penetration;

        const normalSpeed = ball.vx * nx + ball.vy * ny;
        if (normalSpeed < 0) {
          const restitution = .08;
          ball.vx -= (1 + restitution) * normalSpeed * nx;
          ball.vy -= (1 + restitution) * normalSpeed * ny;
        }

        const tangentX = -ny;
        const tangentY = nx;
        const tangentSpeed = ball.vx * tangentX + ball.vy * tangentY;
        const friction = .012;
        ball.vx -= tangentSpeed * friction * tangentX;
        ball.vy -= tangentSpeed * friction * tangentY;
      });
    };

    const resolveBallPair = () => {
      if (ballBodies.length < 2) return;
      const first = ballBodies[0];
      const second = ballBodies[1];
      const dx = second.x - first.x;
      const dy = second.y - first.y;
      const distance = Math.hypot(dx, dy) || .01;
      const minimum = first.radius + second.radius;
      if (distance >= minimum) return;
      const nx = dx / distance;
      const ny = dy / distance;
      const overlap = (minimum - distance) / 2 + .02;
      first.x -= nx * overlap;
      first.y -= ny * overlap;
      second.x += nx * overlap;
      second.y += ny * overlap;
      const relative = (second.vx - first.vx) * nx + (second.vy - first.vy) * ny;
      if (relative < 0) {
        const impulse = -(1.16 * relative) / 2;
        first.vx -= impulse * nx;
        first.vy -= impulse * ny;
        second.vx += impulse * nx;
        second.vy += impulse * ny;
      }
    };

    const simulateBalls = (delta) => {
      if (!ballsAwake) return;
      const substeps = 3;
      const step = delta / substeps;
      ballBodies.forEach((ball) => { ball.previousX = ball.x; });
      for (let iteration = 0; iteration < substeps; iteration += 1) {
        ballBodies.forEach((ball) => {
          ball.vy += 620 * step;
          ball.vx *= Math.pow(.996, step * 60);
          ball.vy *= Math.pow(.999, step * 60);
          ball.x += ball.vx * step;
          ball.y += ball.vy * step;
          resolveBallTerrain(ball);

          if (ball.x < ball.radius) {
            ball.x = ball.radius;
            ball.vx = Math.abs(ball.vx) * .35;
          }
          if (ball.x > trackWidth - ball.radius) {
            ball.x = trackWidth - ball.radius;
            ball.vx = -Math.abs(ball.vx) * .35;
          }
          if (ball.y > trackHeight + ball.radius * 2) {
            ball.y = triangles[0].offsetTop - ball.radius;
            ball.vy = 0;
          }
        });
        resolveBallPair();
      }
      ballBodies.forEach((ball) => {
        const travelled = ball.x - ball.previousX;
        ball.angle += travelled / ball.radius * 180 / Math.PI;
        if (Math.abs(ball.vx) < .08) ball.vx = 0;
      });
      renderBalls();
    };

    const kickBalls = (direction) => {
      ballsAwake = true;
      ballBodies.forEach((ball, index) => {
        ball.vx += direction * (390 + index * 16);
        ball.vy -= 10;
        ball.vx = Math.max(-520, Math.min(520, ball.vx));
      });
    };

    const elements = $$('.fun-particle', field);
    const seeds = [
      [171, 67, -8, 5, 0], [139, 82, 7, -3, -24], [222, 83, 8, 3, 0],
      [204, 59, -4, 7, 18], [139, 119, 5, -7, 0], [244, 77, -7, 4, 78],
      [195, 128, 4, -5, 0], [108, 132, 7, 2, -18], [252, 124, -6, -4, 0],
      [214, 132, 3, -8, 38], [292, 91, -8, 1, 92]
    ];
    let fieldWidth = field.clientWidth || 360;
    let fieldHeight = field.clientHeight || 190;
    const particles = elements.map((element, index) => {
      const seed = seeds[index] || seeds[index % seeds.length];
      const circle = element.classList.contains('circle');
      return {
        element,
        x: seed[0] * fieldWidth / 360,
        y: seed[1] * fieldHeight / 190,
        homeX: seed[0] * fieldWidth / 360,
        homeY: seed[1] * fieldHeight / 190,
        vx: seed[2],
        vy: seed[3],
        radius: circle ? 30 : 25,
        angle: seed[4],
        spin: (index % 2 ? -1 : 1) * (8 + index % 4 * 3)
      };
    });

    const renderParticles = () => {
      particles.forEach((particle) => {
        particle.element.style.transform = `translate3d(${particle.x - particle.radius}px,${particle.y - particle.radius}px,0) rotate(${particle.angle}deg)`;
      });
    };
    renderParticles();

    let burstTimer = null;
    const burst = (power = 132) => {
      const centerX = particles.reduce((sum, particle) => sum + particle.x, 0) / particles.length;
      const centerY = particles.reduce((sum, particle) => sum + particle.y, 0) / particles.length;
      particles.forEach((particle, index) => {
        const dx = particle.x - centerX || (index % 2 ? -1 : 1);
        const dy = particle.y - centerY || (index % 3 - 1);
        const distance = Math.hypot(dx, dy) || 1;
        const strength = power * (.78 + (index % 4) * .08);
        particle.vx += dx / distance * strength;
        particle.vy += dy / distance * strength;
        particle.spin += (index % 2 ? -1 : 1) * 42;
      });
    };
    const collideThenBurst = () => {
      clearTimeout(burstTimer);
      const centerX = fieldWidth / 2;
      const centerY = fieldHeight / 2;
      particles.forEach((particle) => {
        const dx = centerX - particle.x;
        const dy = centerY - particle.y;
        const distance = Math.hypot(dx, dy) || 1;
        particle.vx += dx / distance * 82;
        particle.vy += dy / distance * 82;
      });
      burstTimer = setTimeout(() => burst(), 260);
    };

    if (!reducedMotion) {
      let previousTime = performance.now();
      let nextAutomaticCollision = previousTime + 1900;
      const simulate = (time) => {
        const delta = Math.min(.034, Math.max(.001, (time - previousTime) / 1000));
        previousTime = time;
        const rect = section.getBoundingClientRect();
        const active = rect.top < innerHeight && rect.bottom > 0;
        if (active) {
          simulateBalls(delta);
          if (time >= nextAutomaticCollision) {
            collideThenBurst();
            nextAutomaticCollision = time + 3400;
          }
          particles.forEach((particle) => {
            particle.vx += (particle.homeX - particle.x) * .46 * delta;
            particle.vy += (particle.homeY - particle.y) * .46 * delta;
            const damping = Math.pow(.982, delta * 60);
            particle.vx *= damping;
            particle.vy *= damping;
            particle.x += particle.vx * delta;
            particle.y += particle.vy * delta;
            particle.angle += particle.spin * delta;
            particle.spin *= Math.pow(.988, delta * 60);
          });

          for (let first = 0; first < particles.length; first += 1) {
            for (let second = first + 1; second < particles.length; second += 1) {
              const a = particles[first];
              const b = particles[second];
              const dx = b.x - a.x;
              const dy = b.y - a.y;
              const distance = Math.hypot(dx, dy) || .01;
              const minimum = (a.radius + b.radius) * .78;
              if (distance >= minimum) continue;
              const nx = dx / distance;
              const ny = dy / distance;
              const overlap = (minimum - distance) / 2;
              a.x -= nx * overlap;
              a.y -= ny * overlap;
              b.x += nx * overlap;
              b.y += ny * overlap;
              const relative = (b.vx - a.vx) * nx + (b.vy - a.vy) * ny;
              if (relative < 0) {
                const impulse = -(1.08 * relative);
                a.vx -= impulse * nx;
                a.vy -= impulse * ny;
                b.vx += impulse * nx;
                b.vy += impulse * ny;
              }
            }
          }

          particles.forEach((particle) => {
            const margin = particle.radius * .72;
            if (particle.x < margin) { particle.x = margin; particle.vx = Math.abs(particle.vx) * .88; }
            if (particle.x > fieldWidth - margin) { particle.x = fieldWidth - margin; particle.vx = -Math.abs(particle.vx) * .88; }
            if (particle.y < margin) { particle.y = margin; particle.vy = Math.abs(particle.vy) * .88; }
            if (particle.y > fieldHeight - margin) { particle.y = fieldHeight - margin; particle.vy = -Math.abs(particle.vy) * .88; }
          });
          renderParticles();
        }
        requestAnimationFrame(simulate);
      };
      requestAnimationFrame(simulate);
    }

    let wheelDistance = 0;
    let lastMove = 0;
    addEventListener('wheel', (event) => {
      if (reducedMotion || Math.abs(event.deltaY) < 1) return;
      const rect = section.getBoundingClientRect();
      if (rect.top >= innerHeight || rect.bottom <= 0) return;
      wheelDistance += event.deltaY;
      const time = performance.now();
      if (Math.abs(wheelDistance) < 34 || time - lastMove < 540) return;
      const direction = wheelDistance > 0 ? 1 : -1;
      wheelDistance = 0;
      lastMove = time;
      kickBalls(direction);
      collideThenBurst();
    }, { passive: true });

    if (!reducedMotion && matchMedia('(hover:none) and (pointer:coarse)').matches) {
      let touchStartY = null;
      section.addEventListener('touchstart', (event) => {
        touchStartY = event.touches[0]?.clientY ?? null;
      }, { passive: true });
      section.addEventListener('touchend', (event) => {
        if (touchStartY === null) return;
        const distance = touchStartY - (event.changedTouches[0]?.clientY ?? touchStartY);
        touchStartY = null;
        if (Math.abs(distance) < 24) return;
        kickBalls(distance > 0 ? 1 : -1);
        collideThenBurst();
      }, { passive: true });
      section.addEventListener('touchcancel', () => { touchStartY = null; }, { passive: true });
      const entrance = new IntersectionObserver((entries) => {
        if (!entries[0].isIntersecting) return;
        kickBalls(1);
        entrance.disconnect();
      }, { threshold: .35 });
      entrance.observe(section);
    }

    new ResizeObserver(() => {
      const nextTrackWidth = track.clientWidth || 340;
      const nextTrackHeight = track.clientHeight || 164;
      if (nextTrackWidth !== trackWidth || nextTrackHeight !== trackHeight) {
        const ratioX = nextTrackWidth / trackWidth;
        const ratioY = nextTrackHeight / trackHeight;
        ballBodies.forEach((ball) => {
          ball.x *= ratioX;
          ball.y *= ratioY;
          ball.vx *= ratioX;
          ball.vy *= ratioY;
        });
        trackWidth = nextTrackWidth;
        trackHeight = nextTrackHeight;
        refreshTerrain();
        renderBalls();
      }
      const nextWidth = field.clientWidth || 360;
      const nextHeight = field.clientHeight || 190;
      if (nextWidth !== fieldWidth || nextHeight !== fieldHeight) {
        const ratioX = nextWidth / fieldWidth;
        const ratioY = nextHeight / fieldHeight;
        particles.forEach((particle) => {
          particle.x *= ratioX;
          particle.y *= ratioY;
          particle.homeX *= ratioX;
          particle.homeY *= ratioY;
        });
        fieldWidth = nextWidth;
        fieldHeight = nextHeight;
        renderParticles();
      }
    }).observe(section);
  }

  function setupWorks() {
    const slider = $('#workSlider');
    const track = $('#workTrack');
    const dotsWrap = $('#workDots');
    const dialog = $('#workDialog');
    if (!slider || !track || !dotsWrap) return;
    const name = $('#projectName');
    const description = $('#projectDescription');
    const tags = $('#projectTags');
    const projects = content.works || [];
    if (!projects.length) return;
    const slides = projects.map((project, index) => {
      const slide = document.createElement('button');
      const image = document.createElement('img');
      slide.className = 'work-slide';
      slide.type = 'button';
      const localized = projectInLanguage(project);
      slide.setAttribute('aria-label', `${currentLanguage === 'zh' ? '打开项目' : 'Open project'}: ${localized.name}`);
      slide.style.flexBasis = `${100 / projects.length}%`;
      image.src = project.poster;
      image.alt = '';
      image.decoding = 'async';
      if (index > 0) image.loading = 'lazy';
      slide.append(image);
      return slide;
    });
    track.style.width = `${projects.length * 100}%`;
    track.replaceChildren(...slides);
    let current = 0;
    let startX = null;
    let dragX = 0;
    let suppressClick = false;
    let autoplayTimer = null;

    const show = (index) => {
      current = (index + slides.length) % slides.length;
      const project = projectInLanguage(projects[current]);
      track.style.transform = `translateX(-${current * (100 / slides.length)}%)`;
      name.textContent = project.name;
      description.textContent = project.description;
      tags.replaceChildren(...project.tags.map((label) => {
        const tag = document.createElement('span');
        tag.textContent = label;
        return tag;
      }));
      $$('button', dotsWrap).forEach((dot, i) => {
        dot.classList.toggle('is-active', i === current);
        dot.setAttribute('aria-selected', String(i === current));
      });
    };

    const openProject = (index) => {
      const sourceProject = projects[index];
      const project = sourceProject && projectInLanguage(sourceProject);
      if (!dialog || !project) return;
      $('#caseTitle').textContent = project.name;
      $('#caseDescription').textContent = project.description;
      $('#caseTags').replaceChildren(...project.tags.map((label) => {
        const tag = document.createElement('span');
        tag.textContent = label;
        return tag;
      }));
      const caseVideo = $('#caseVideo');
      caseVideo.pause();
      caseVideo.src = sourceProject.video;
      caseVideo.poster = sourceProject.poster;
      caseVideo.preload = 'auto';
      caseVideo.currentTime = 0;
      caseVideo.load();
      dialog.showModal();
      caseVideo.addEventListener('playing', () => {
        caseVideo.removeAttribute('poster');
      }, { once: true });
      caseVideo.play().catch(() => {
        caseVideo.poster = sourceProject.poster;
      });
    };

    const stopAutoplay = () => {
      if (autoplayTimer !== null) {
        clearInterval(autoplayTimer);
        autoplayTimer = null;
      }
    };

    const startAutoplay = () => {
      stopAutoplay();
      if (reducedMotion) return;
      autoplayTimer = setInterval(() => show(current + 1), 3000);
    };

    slides.forEach((slide, i) => {
      const dot = document.createElement('button');
      dot.type = 'button';
      dot.setAttribute('aria-label', String(i + 1));
      dot.addEventListener('click', () => {
        stopAutoplay();
        show(i);
      });
      dotsWrap.append(dot);
      slide.addEventListener('click', () => {
        if (!suppressClick) openProject(i);
      });
    });
    show(0);
    startAutoplay();

    $('.nav-links a[href="#work"]')?.addEventListener('click', () => {
      startAutoplay();
    });

    slider.addEventListener('pointerdown', (event) => {
      if (event.target.closest('.work-dots')) return;
      startX = event.clientX;
      dragX = 0;
      suppressClick = false;
      slider.classList.add('is-dragging');
      slider.setPointerCapture(event.pointerId);
    });
    slider.addEventListener('pointermove', (event) => {
      if (startX === null) return;
      dragX = event.clientX - startX;
      if (Math.abs(dragX) > 5) suppressClick = true;
      track.style.transform = `translateX(calc(-${current * (100 / slides.length)}% + ${dragX}px))`;
    });
    slider.addEventListener('pointerup', (event) => {
      if (startX === null) return;
      const activate = Math.abs(dragX) <= 5;
      const threshold = slider.clientWidth * .1;
      if (Math.abs(dragX) > threshold) show(current + (dragX < 0 ? 1 : -1));
      else show(current);
      startX = null;
      dragX = 0;
      slider.classList.remove('is-dragging');
      if (activate) {
        setTimeout(() => {
          if (dialog && !dialog.open) openProject(current);
        }, 0);
      }
      setTimeout(() => { suppressClick = false; }, 0);
    });
    slider.addEventListener('pointercancel', () => {
      startX = null;
      dragX = 0;
      slider.classList.remove('is-dragging');
      show(current);
    });
    $('#closeWork')?.addEventListener('click', () => dialog.close());
    dialog?.addEventListener('click', (event) => {
      if (event.target === dialog) dialog.close();
    });
    dialog?.addEventListener('close', () => {
      const caseVideo = $('#caseVideo');
      caseVideo?.pause();
    });
    addEventListener('portfolio-languagechange', () => {
      slides.forEach((slide, index) => {
        const project = projectInLanguage(projects[index]);
        slide.setAttribute('aria-label', `${currentLanguage === 'zh' ? '打开项目' : 'Open project'}: ${project.name}`);
      });
      show(current);
      if (dialog?.open) {
        const project = projectInLanguage(projects[current]);
        $('#caseTitle').textContent = project.name;
        $('#caseDescription').textContent = project.description;
        $('#caseTags').replaceChildren(...project.tags.map((label) => {
          const tag = document.createElement('span');
          tag.textContent = label;
          return tag;
        }));
      }
    });
    addEventListener('pagehide', stopAutoplay, { once: true });
  }

  function setupMe() {
    const page = $('.me-page');
    const shell = page?.closest('.me-shell');
    if (!page || !shell) return;

    const createAboutImage = (item) => {
      const image = document.createElement('img');
      image.src = item.src;
      image.alt = item.alt || '';
      image.width = item.width;
      image.height = item.height;
      image.loading = 'lazy';
      image.decoding = 'async';
      return image;
    };
    const about = content.about || {};
    const zhuhaiStack = $('.photo-stack-a', page);
    const makingStack = $('.photo-stack-b', page);
    const exploreStrip = $('.me-image-strip', page);
    if (zhuhaiStack) zhuhaiStack.replaceChildren(...(about.zhuhai || []).map(createAboutImage));
    if (makingStack) makingStack.replaceChildren(...(about.making || []).map(createAboutImage));
    if (exploreStrip) exploreStrip.replaceChildren(...(about.explore || []).map(createAboutImage));

    const fitPage = () => {
      if (innerWidth <= 800) {
        page.style.transform = '';
        shell.style.height = '';
        return;
      }
      const scale = shell.clientWidth / 1280;
      page.style.transform = `scale(${scale})`;
      shell.style.height = `${4223 * scale}px`;
    };
    fitPage();

    const bubble = $('#beliefBubble');
    const text = $('#beliefBubbleText');
    if (bubble && text) {
      const getMessages = () => i18n.about?.[currentLanguage]?.beliefs || [];
      let index = 0;
      bubble.addEventListener('click', () => {
        const messages = getMessages();
        if (!messages.length) return;
        index = (index + 1) % messages.length;
        text.style.opacity = '0';
        setTimeout(() => {
          text.textContent = messages[index];
          text.style.opacity = '1';
        }, reducedMotion ? 0 : 170);
      });
      addEventListener('portfolio-languagechange', () => {
        const messages = getMessages();
        text.textContent = messages[index] || '';
      });
    }

    const objectScene = $('.me-object-scene', page);
    const objectBubble = objectScene && $('.object-bubble', objectScene);
    const interestObjects = objectScene ? $$('.me-object', objectScene) : [];
    if (objectScene && objectBubble && interestObjects.length) {
      const bubbleText = $('span', objectBubble);
      document.body.append(objectBubble);
      let bubbleTimer = null;
      const hideObjectBubble = () => {
        clearTimeout(bubbleTimer);
        objectBubble.classList.remove('is-visible');
        objectBubble.setAttribute('aria-hidden', 'true');
      };
      const showObjectBubble = (item, linger = false) => {
        const message = item.dataset.message;
        if (!message) {
          hideObjectBubble();
          return;
        }
        clearTimeout(bubbleTimer);
        bubbleText.textContent = message;
        const bubbleWidth = objectBubble.offsetWidth || 240;
        const bubbleHeight = objectBubble.offsetHeight || 70;
        const itemRect = item.getBoundingClientRect();
        const center = itemRect.left + itemRect.width / 2;
        const left = Math.max(bubbleWidth / 2 + 10, Math.min(innerWidth - bubbleWidth / 2 - 10, center));
        let top = itemRect.top - bubbleHeight - 10;
        if (top < 62) top = itemRect.bottom + 10;
        objectBubble.style.left = `${left}px`;
        objectBubble.style.top = `${top}px`;
        objectBubble.classList.add('is-visible');
        objectBubble.setAttribute('aria-hidden', 'false');
        if (linger) bubbleTimer = setTimeout(hideObjectBubble, 1800);
      };

      interestObjects.forEach((item) => {
        item.addEventListener('pointerenter', () => showObjectBubble(item));
        item.addEventListener('pointerleave', hideObjectBubble);
        item.addEventListener('focus', () => showObjectBubble(item));
        item.addEventListener('blur', hideObjectBubble);
        if (!item.classList.contains('me-object-plant')) {
          item.addEventListener('click', () => showObjectBubble(item, true));
        }
      });
      const plant = $('.me-object-plant', objectScene);
      if (plant) {
        const wateringCursor = document.createElement('div');
        const wateringImage = document.createElement('img');
        wateringCursor.className = 'watering-cursor';
        wateringImage.src = './assets/me-watering-can.png';
        wateringImage.alt = '';
        wateringCursor.append(wateringImage);
        document.body.append(wateringCursor);

        const moveWateringCursor = (event) => {
          wateringCursor.style.transform = `translate3d(${event.clientX - 12}px,${event.clientY - 24}px,0)`;
        };
        plant.addEventListener('pointerenter', (event) => {
          moveWateringCursor(event);
          wateringCursor.classList.add('is-visible');
        });
        plant.addEventListener('pointermove', moveWateringCursor);
        plant.addEventListener('pointerleave', () => wateringCursor.classList.remove('is-visible'));
        plant.addEventListener('click', (event) => {
          hideObjectBubble();
          const sprayLayer = document.createElement('div');
          sprayLayer.className = 'water-spray-layer';
          document.body.append(sprayLayer);
          for (let i = 0; i < 16; i += 1) {
            const drop = document.createElement('i');
            drop.className = 'water-drop';
            drop.style.left = `${event.clientX - 14 + Math.random() * 20}px`;
            drop.style.top = `${event.clientY + 5 + Math.random() * 12}px`;
            drop.style.setProperty('--delay', `${Math.random() * .18}s`);
            drop.style.setProperty('--drift', `${-46 + Math.random() * 62}px`);
            drop.style.setProperty('--fall', `${58 + Math.random() * 42}px`);
            sprayLayer.append(drop);
          }
          plant.classList.remove('is-watering');
          void plant.offsetWidth;
          plant.classList.add('is-watering');
          setTimeout(() => plant.classList.remove('is-watering'), 820);
          setTimeout(() => sprayLayer.remove(), 1100);
        });
        addEventListener('pagehide', () => wateringCursor.remove(), { once: true });
      }
    }

    const strip = $('.me-image-strip');
    if (!strip || reducedMotion) return;
    const originals = [...strip.children];
    originals.forEach((item) => {
      const clone = item.cloneNode(true);
      clone.style.flexBasis = `${item.offsetWidth}px`;
      clone.setAttribute('aria-hidden', 'true');
      strip.append(clone);
    });
    let stripAnimation;
    const startStrip = () => {
      stripAnimation?.cancel();
      const gap = Number.parseFloat(getComputedStyle(strip).gap) || 0;
      const distance = originals.reduce((total, item) => total + item.offsetWidth, 0) + gap * originals.length;
      stripAnimation = strip.animate(
        [{ transform: 'translateX(0)' }, { transform: `translateX(-${distance}px)` }],
        { duration: Math.max(18000, distance * 18), iterations: Infinity, easing: 'linear' }
      );
    };
    startStrip();
    let resizeTimer;
    addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(() => {
        fitPage();
        startStrip();
      }, 160);
    }, { passive: true });
  }

  function setupGalleryPreview() {
    const targets = $$('.gallery-preview-grid span');
    if (!targets.length) return;
    const gallery = content.gallery || [];
    const imageItems = (category, count) => gallery.filter((item) => item.category === category && item.type === 'image').slice(0, count);
    const previewItems = [
      ...(content.galleryPreview || []).slice(0, 1),
      ...imageItems('drawing', 2),
      ...imageItems('photo', 3),
      ...imageItems('visual', 1),
      ...imageItems('architecture', 2)
    ];
    targets.forEach((target, index) => {
      if (target.querySelector('img')) return;
      const item = previewItems[index % previewItems.length];
      if (!item) return;
      const image = document.createElement('img');
      image.src = item.type === 'video' ? item.poster : item.src;
      image.alt = item.title || '';
      image.loading = 'lazy';
      image.decoding = 'async';
      if (item.width && item.height) {
        image.width = item.width;
        image.height = item.height;
      }
      target.append(image);
    });
  }

  function setupGallery() {
    const tabs = $$('.gallery-tabs button');
    const viewport = $('#galleryViewport');
    const boards = $$('.gallery-board');
    const tooltip = $('#galleryTooltip');
    if (!tabs.length || !viewport || !boards.length) return;

    const categoryStarts = new Map();
    const boardsByCategory = new Map();
    boards.forEach((board) => {
      if (board.hasAttribute('data-category-start')) categoryStarts.set(board.dataset.category, board);
      if (!boardsByCategory.has(board.dataset.category)) boardsByCategory.set(board.dataset.category, []);
      boardsByCategory.get(board.dataset.category).push(board);
    });

    let activeCategory = 'drawing';
    let isSectionJump = false;
    let jumpTarget = null;
    let jumpSettleTimer = 0;
    let isClamping = false;

    const setActiveTab = (category) => {
      activeCategory = category;
      tabs.forEach((tab) => {
        const active = tab.dataset.filter === category;
        tab.classList.toggle('is-active', active);
        tab.setAttribute('aria-selected', String(active));
      });
    };

    const getCategoryBounds = (category) => {
      const categoryBoards = boardsByCategory.get(category) || [];
      const first = categoryBoards[0];
      const last = categoryBoards[categoryBoards.length - 1];
      if (!first || !last) return { start: 0, end: 0 };
      const start = first.offsetLeft;
      const end = Math.max(start, last.offsetLeft + last.offsetWidth - viewport.clientWidth);
      return { start, end };
    };

    const finishSectionJump = () => {
      clearTimeout(jumpSettleTimer);
      if (jumpTarget) viewport.scrollLeft = jumpTarget.offsetLeft;
      jumpTarget = null;
      isSectionJump = false;
    };

    const scrollToCategory = (category, behavior = reducedMotion ? 'auto' : 'smooth') => {
      const target = categoryStarts.get(category);
      if (!target) return;
      setActiveTab(category);
      isSectionJump = true;
      jumpTarget = target;
      viewport.scrollTo({ left: target.offsetLeft, behavior });
      clearTimeout(jumpSettleTimer);
      jumpSettleTimer = window.setTimeout(finishSectionJump, behavior === 'auto' ? 0 : 1500);
    };

    const moveWithinCategory = (distance, behavior = 'auto') => {
      const bounds = getCategoryBounds(activeCategory);
      const destination = Math.min(bounds.end, Math.max(bounds.start, viewport.scrollLeft + distance));
      viewport.scrollTo({ left: destination, behavior });
    };

    tabs.forEach((tab) => {
      tab.addEventListener('click', () => scrollToCategory(tab.dataset.filter));
      tab.addEventListener('pointerenter', (event) => {
        tooltip.textContent = tab.dataset.label;
        tooltip.style.left = `${event.clientX + 14}px`;
        tooltip.style.top = `${event.clientY}px`;
        tooltip.classList.add('is-visible');
        tooltip.setAttribute('aria-hidden', 'false');
      });
      tab.addEventListener('pointermove', (event) => {
        tooltip.style.left = `${event.clientX + 14}px`;
        tooltip.style.top = `${event.clientY}px`;
      });
      tab.addEventListener('pointerleave', () => {
        tooltip.classList.remove('is-visible');
        tooltip.setAttribute('aria-hidden', 'true');
      });
    });

    $$('[data-gallery-jump]').forEach((button) => {
      button.addEventListener('click', () => scrollToCategory(button.dataset.galleryJump));
    });

    viewport.addEventListener('wheel', (event) => {
      if (event.ctrlKey) return;
      const distance = Math.abs(event.deltaY) >= Math.abs(event.deltaX) ? event.deltaY : event.deltaX;
      if (!distance) return;
      event.preventDefault();
      if (isSectionJump) return;
      moveWithinCategory(distance * 1.55);
    }, { passive: false });

    viewport.addEventListener('keydown', (event) => {
      if (event.key !== 'ArrowLeft' && event.key !== 'ArrowRight') return;
      event.preventDefault();
      if (isSectionJump) return;
      moveWithinCategory(
        (event.key === 'ArrowRight' ? 1 : -1) * viewport.clientWidth * .82,
        reducedMotion ? 'auto' : 'smooth'
      );
    });

    viewport.addEventListener('scroll', () => {
      if (isSectionJump) {
        clearTimeout(jumpSettleTimer);
        jumpSettleTimer = window.setTimeout(finishSectionJump, 180);
        return;
      }
      if (isClamping) return;
      const bounds = getCategoryBounds(activeCategory);
      const clamped = Math.min(bounds.end, Math.max(bounds.start, viewport.scrollLeft));
      if (Math.abs(clamped - viewport.scrollLeft) < .5) return;
      isClamping = true;
      viewport.scrollLeft = clamped;
      requestAnimationFrame(() => { isClamping = false; });
    }, { passive: true });

    window.addEventListener('resize', () => moveWithinCategory(0), { passive: true });

    setActiveTab('drawing');
  }

  function setupCanopy() {
    const canvas = $('#canopy');
    if (!canvas || reducedMotion) return;
    const ctx = canvas.getContext('2d');
    const pointer = { x: -10000, y: -10000, active: false };
    const TAU = Math.PI * 2;
    let width = 0;
    let height = 0;
    let dpr = 1;
    let trees = [];
    let falling = [];
    let frameId = 0;
    let lastTime = performance.now();

    const rand = (min, max) => min + Math.random() * (max - min);
    const seeded = (seed) => {
      const value = Math.sin(seed * 9187.31) * 43758.5453;
      return value - Math.floor(value);
    };

    function branch(seed, depth, maxDepth, length, angle, curve) {
      const node = { seed, depth, maxDepth, length, angle, curve, children: [], leaves: [] };
      if (depth < maxDepth) {
        const count = depth < 2 ? 3 : (seeded(seed + 4.2) > .5 ? 2 : 1);
        for (let i = 0; i < count; i += 1) {
          const spread = (i - (count - 1) / 2) * rand(.3, .46) + rand(-.09, .09);
          node.children.push(branch(
            seed * 2.17 + i + 1,
            depth + 1,
            maxDepth,
            length * rand(.64, .78),
            angle + spread,
            rand(-.1, .1)
          ));
        }
      }
      if (depth >= maxDepth - 1) {
        const levels = depth === maxDepth ? [0.45, 0.7] : [0.68];
        levels.forEach((position) => {
          node.leaves.push(
            { position, side: -1, size: rand(5.5, 8), phase: rand(0, TAU) },
            { position, side: 1, size: rand(5.5, 8), phase: rand(0, TAU) }
          );
        });
        if (depth === maxDepth) {
          node.leaves.push({ position: 1, side: 0, size: rand(6, 9), phase: rand(0, TAU), tip: true });
        }
      }
      return node;
    }

    function buildTrees() {
      const scale = Math.min(width, height);
      const specs = width < 700
        ? [[-.05,.28,.14,.31,4],[1.05,.28,Math.PI-.14,.28,4],[.25,-.08,1.34,.23,3],[.82,-.08,1.86,.23,3]]
        : [[-.04,.27,.08,.3,4],[-.05,.77,-.12,.25,4],[1.04,.27,Math.PI-.08,.3,4],[1.04,.74,Math.PI+.12,.26,4],[.16,-.08,1.23,.24,4],[.49,-.1,1.52,.2,3],[.84,-.08,1.88,.24,4]];
      trees = specs.map((spec, i) => ({
        x: spec[0] * width,
        y: spec[1] * height,
        angle: spec[2],
        root: branch(11 + i * 17, 0, spec[4], spec[3] * scale, spec[2], rand(-.08, .08)),
        displacement: [0, 0, 0, 0],
        velocity: [0, 0, 0, 0],
        leafPoints: []
      }));
    }

    function resize() {
      const rect = canvas.getBoundingClientRect();
      width = rect.width;
      height = rect.height;
      dpr = Math.min(devicePixelRatio || 1, 2);
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      buildTrees();
    }
    new ResizeObserver(resize).observe(canvas);

    function wind(tree, time) {
      if (!pointer.active) return Math.sin(time * .0003 + tree.x * .008) * .05;
      const radius = Math.max(width, height) * .55;
      const distance = Math.hypot(pointer.x - tree.x, pointer.y - tree.y);
      const influence = Math.max(0, 1 - distance / radius);
      const direction = pointer.x >= tree.x ? 1 : -1;
      return direction * influence * .75 + Math.sin(time * .0003 + tree.x * .008) * .05;
    }

    function integrate(tree, time) {
      const force = wind(tree, time);
      const target = [force * .06, force * .2, force * .5, force];
      const stiffness = [.006, .012, .022, .04];
      const damping = [.94, .925, .9, .86];
      for (let i = 0; i < 4; i += 1) {
        tree.velocity[i] += (target[i] - tree.displacement[i]) * stiffness[i];
        tree.velocity[i] *= damping[i];
        tree.displacement[i] += tree.velocity[i];
      }
    }

    function pointOnCurve(start, control, end, t) {
      const u = 1 - t;
      return {
        x: u * u * start.x + 2 * u * t * control.x + t * t * end.x,
        y: u * u * start.y + 2 * u * t * control.y + t * t * end.y
      };
    }

    function drawLeaf(x, y, angle, size, opacity) {
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(angle);
      ctx.globalAlpha = opacity;
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.bezierCurveTo(size * .8, -size * .55, size * 1.9, -size * .35, size * 2.05, 0);
      ctx.bezierCurveTo(size * 1.75, size * .55, size * .7, size * .55, 0, 0);
      ctx.stroke();
      ctx.beginPath();
      ctx.moveTo(0, 0);
      ctx.lineTo(size * 1.8, 0);
      ctx.stroke();
      ctx.restore();
    }

    function drawBranch(tree, node, start, baseAngle, time) {
      const tier = Math.min(3, Math.floor(node.depth / Math.max(1, node.maxDepth) * 4));
      const pressure = tree.displacement[tier] * (.12 + node.depth * .055);
      const slowWave = Math.sin(time * .00052 + node.seed) * (.006 + node.depth * .0025);
      const angle = baseAngle + pressure + slowWave;
      const end = {
        x: start.x + Math.cos(angle) * node.length,
        y: start.y + Math.sin(angle) * node.length
      };
      const normal = angle + Math.PI / 2;
      const control = {
        x: (start.x + end.x) / 2 + Math.cos(normal) * node.length * node.curve,
        y: (start.y + end.y) / 2 + Math.sin(normal) * node.length * node.curve
      };
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.quadraticCurveTo(control.x, control.y, end.x, end.y);
      ctx.stroke();

      node.leaves.forEach((leaf) => {
        const point = pointOnCurve(start, control, end, leaf.position);
        const leafAngle = angle + leaf.side * 1.03 + tree.displacement[3] * .5 + Math.sin(time * .0008 + leaf.phase) * .05;
        drawLeaf(point.x, point.y, leafAngle, leaf.size, .42 + node.depth / node.maxDepth * .42);
        if (leaf.tip || leaf.position > .68) tree.leafPoints.push({ x: point.x, y: point.y, angle: leafAngle, size: leaf.size });
      });
      node.children.forEach((child) => {
        drawBranch(tree, child, end, angle + child.angle - node.angle, time);
      });
    }

    function drawFalling(delta) {
      for (let i = falling.length - 1; i >= 0; i -= 1) {
        const leaf = falling[i];
        leaf.life -= delta;
        leaf.vy += delta * .000018;
        leaf.x += leaf.vx * delta;
        leaf.y += leaf.vy * delta;
        leaf.angle += leaf.spin * delta;
        drawLeaf(leaf.x, leaf.y, leaf.angle, leaf.size, Math.min(.65, leaf.life / 900));
        if (leaf.life <= 0 || leaf.y > height + 30) falling.splice(i, 1);
      }
    }

    function render(time) {
      const delta = Math.min(32, time - lastTime);
      lastTime = time;
      ctx.clearRect(0, 0, width, height);
      ctx.strokeStyle = 'rgba(0,0,0,.46)';
      ctx.lineWidth = 1;
      ctx.lineCap = 'round';
      ctx.lineJoin = 'round';
      trees.forEach((tree) => {
        tree.leafPoints = [];
        integrate(tree, time);
        drawBranch(tree, tree.root, { x: tree.x, y: tree.y }, tree.angle, time);
      });
      drawFalling(delta);
      frameId = requestAnimationFrame(render);
    }

    function setPointer(event) {
      const rect = canvas.getBoundingClientRect();
      pointer.x = event.clientX - rect.left;
      pointer.y = event.clientY - rect.top;
      pointer.active = true;
    }
    canvas.addEventListener('pointerenter', setPointer);
    canvas.addEventListener('pointermove', setPointer);
    canvas.addEventListener('pointerleave', () => { pointer.active = false; });
    canvas.addEventListener('pointerdown', (event) => {
      setPointer(event);
      const nearest = trees
        .flatMap((tree) => tree.leafPoints)
        .sort((a, b) => Math.hypot(a.x - pointer.x, a.y - pointer.y) - Math.hypot(b.x - pointer.x, b.y - pointer.y))
        .slice(0, 10);
      nearest.forEach((leaf, i) => {
        falling.push({
          x: leaf.x,
          y: leaf.y,
          angle: leaf.angle,
          size: leaf.size,
          life: rand(2600, 4400),
          vx: rand(-.025, .035) + (pointer.x - leaf.x) * .00002,
          vy: rand(.015, .045),
          spin: rand(-.004, .004) * (i % 2 ? 1 : -1)
        });
      });
    });
    frameId = requestAnimationFrame(render);
    addEventListener('pagehide', () => cancelAnimationFrame(frameId), { once: true });
  }

  setupLanguage();
  setupBeliefMotion();
  setupWorks();
  setupGalleryPreview();
  setupMe();
  setupGallery();
  setupCanopy();
})();
