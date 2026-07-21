/* ----------------------------------------------------
   NEXUS MINIMALIST INTERACTION ENGINE
   ---------------------------------------------------- */

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. STICKY HEADER SCROLLSPY NAVIGATION ---
    const sections = document.querySelectorAll('.content-section');
    const navLinks = document.querySelectorAll('.main-nav .nav-link');
    const mobileHeader = document.querySelector('.mobile-header');
    const mobileMenuToggle = document.querySelector('.mobile-menu-toggle');
    const mobileMenuOverlay = document.querySelector('.mobile-menu-overlay');
    const mobileNavLinks = document.querySelectorAll('.mobile-nav-link');

    // Scrollspy navigation highlights
    window.addEventListener('scroll', () => {
        let activeSectionId = 'overview';
        
        sections.forEach(sec => {
            const sectionTop = sec.offsetTop;
            const sectionHeight = sec.offsetHeight;
            
            // Viewport offset check
            if (window.scrollY >= (sectionTop - 120)) {
                activeSectionId = sec.getAttribute('id');
            }
        });

        // Update Desktop Header Links
        navLinks.forEach(link => {
            const secAttr = link.getAttribute('data-sec');
            link.classList.toggle('active', secAttr === activeSectionId);
        });

        // Update Mobile Header Links
        mobileNavLinks.forEach(link => {
            const hrefSec = link.getAttribute('href').substring(1);
            link.classList.toggle('active', hrefSec === activeSectionId);
        });
    });

    // Mobile Hamburger Menu Trigger
    if (mobileMenuToggle && mobileMenuOverlay) {
        mobileMenuToggle.addEventListener('click', () => {
            const isOpen = mobileMenuToggle.classList.toggle('open');
            mobileMenuOverlay.classList.toggle('open', isOpen);
            document.body.style.overflow = isOpen ? 'hidden' : '';
        });

        // Close mobile drawer on navigation click
        mobileNavLinks.forEach(link => {
            link.addEventListener('click', () => {
                mobileMenuToggle.classList.remove('open');
                mobileMenuOverlay.classList.remove('open');
                document.body.style.overflow = '';
            });
        });
    }

    // Scroll offset jump logic for header links (desktop/mobile)
    const allScrollLinks = document.querySelectorAll('.nav-link, .mobile-nav-link, .header-scroll-btn');
    allScrollLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            const targetId = link.getAttribute('href');
            if (targetId && targetId.startsWith('#')) {
                e.preventDefault();
                const targetElement = document.querySelector(targetId);
                if (targetElement) {
                    const headerHeight = document.querySelector('.site-header').offsetHeight || 54;
                    window.scrollTo({
                        top: targetElement.offsetTop - headerHeight,
                        behavior: 'smooth'
                    });
                }
            }
        });
    });


    // --- 2. APP DEVELOPMENT PROJECT SCOPER ---
    const platformButtons = document.querySelectorAll('.segmented-control .segment-btn');
    const scaleRangeInput = document.getElementById('estimator-range');
    const scaleLabelDisplay = document.getElementById('estimator-scale-lbl');
    const checkboxesList = document.querySelectorAll('.features-checklist-grid input[type="checkbox"]');
    const timelineValDisplay = document.getElementById('timeline-output-val');
    const resourcesValDisplay = document.getElementById('resources-output-val');

    let platformSelection = 'ios';
    
    const scaleBaseWeeks = [2, 6, 12, 20];
    const scaleBaseDevs = [1, 2, 3, 4];
    const scaleBaseLabels = ["Prototype", "Standard MVP", "Advanced Suite", "Enterprise Hub"];
    
    const platformTimelineMultipliers = {
        'ios': 1.0,
        'android': 1.0,
        'both': 1.5
    };
    
    const platformResourcesMultipliers = {
        'ios': 1.0,
        'android': 1.0,
        'both': 1.8
    };

    const addOnFeatureWeeks = {
        'chk-auth': 1,
        'chk-push': 1,
        'chk-pay': 2,
        'chk-offline': 2,
        'chk-chat': 3,
        'chk-ai': 4
    };

    const addOnFeatureDevs = {
        'chk-auth': 0.1,
        'chk-push': 0.1,
        'chk-pay': 0.2,
        'chk-offline': 0.2,
        'chk-chat': 0.3,
        'chk-ai': 0.4
    };

    let previousWeeks = 0;
    let previousDevs = 0;

    function recalculateProjectScope() {
        const scaleIndex = parseInt(scaleRangeInput.value) - 1;
        
        // Base values
        const baseWeeks = scaleBaseWeeks[scaleIndex];
        const baseDevs = scaleBaseDevs[scaleIndex];
        
        // Platform multipliers
        const timelineMultiplier = platformTimelineMultipliers[platformSelection];
        const resourcesMultiplier = platformResourcesMultipliers[platformSelection];
        
        // Feature add-ons
        let extraWeeks = 0;
        let extraDevs = 0;

        checkboxesList.forEach(chk => {
            if (chk.checked) {
                extraWeeks += addOnFeatureWeeks[chk.id] || 0;
                extraDevs += addOnFeatureDevs[chk.id] || 0;
            }
        });

        const targetWeeks = Math.round(baseWeeks * timelineMultiplier + extraWeeks);
        const targetDevs = Math.ceil(baseDevs * resourcesMultiplier + extraDevs);

        // Update scale label
        if (scaleLabelDisplay) scaleLabelDisplay.textContent = scaleBaseLabels[scaleIndex];

        // Animate metrics displays
        previousWeeks = animateEstimatorMetric(timelineValDisplay, previousWeeks, targetWeeks);
        previousDevs = animateEstimatorMetric(resourcesValDisplay, previousDevs, targetDevs);
    }

    function animateEstimatorMetric(displayElement, startValue, endValue) {
        if (!displayElement) return endValue;
        
        const start = startValue;
        const end = endValue;
        const animationTime = 300; // ms
        const startTime = performance.now();

        function step(now) {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / animationTime, 1);
            
            // Cubic ease-out
            const easeFactor = 1 - Math.pow(1 - progress, 3);
            const currentComputedVal = Math.round(start + (end - start) * easeFactor);
            
            displayElement.textContent = currentComputedVal;

            if (progress < 1) {
                requestAnimationFrame(step);
            } else {
                displayElement.textContent = end;
            }
        }

        requestAnimationFrame(step);
        return end;
    }

    // Segment tab handlers
    platformButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            platformButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            platformSelection = btn.getAttribute('data-platform');
            recalculateProjectScope();
        });
    });

    // Slider inputs
    if (scaleRangeInput) {
        scaleRangeInput.addEventListener('input', recalculateProjectScope);
    }

    // Checkboxes change
    checkboxesList.forEach(chk => {
        chk.addEventListener('change', recalculateProjectScope);
    });

    // Run scoper on initialize
    recalculateProjectScope();


    // --- 3. SECURE CREDENTIALS RECOVERY STEP FLOW ---
    const stepInd1 = document.getElementById('ind-step-1');
    const stepInd2 = document.getElementById('ind-step-2');
    const stepInd3 = document.getElementById('ind-step-3');
    
    const bridge1 = document.getElementById('ind-bridge-1');
    const bridge2 = document.getElementById('ind-bridge-2');

    const paneStep1 = document.getElementById('pane-step-1');
    const paneStep2 = document.getElementById('pane-step-2');
    const paneStep3 = document.getElementById('pane-step-3');

    // Step 1: Email Form Elements
    const emailForm = document.getElementById('email-identity-form');
    const emailInputField = document.getElementById('recovery-email-field');
    const emailCheckIcon = document.getElementById('email-check-icon');
    const emailErrorHint = document.getElementById('email-error-hint');

    // Step 2: OTP Verification Elements
    const otpVerifyForm = document.getElementById('otp-verify-form');
    const otpCells = document.querySelectorAll('.otp-fields-row input');
    const otpTimerLabel = document.getElementById('otp-timer-display');
    const otpResendBtn = document.getElementById('otp-resend-btn');
    const emailPlaceholder = document.getElementById('user-email-placeholder');

    // Step 3: Password Reset Elements
    const pwdResetForm = document.getElementById('password-reset-form');
    const pwdInput = document.getElementById('recovery-pwd-field');
    const pwdConfirmInput = document.getElementById('recovery-pwd-confirm-field');
    const pwdStrengthBarFill = document.getElementById('strength-meter-fill');
    const pwdStrengthLabel = document.getElementById('pwd-strength-label');
    const confirmPwdErrorHint = document.getElementById('confirm-pwd-error-hint');

    // Audit checklist indicators
    const auditLen = document.getElementById('audit-len');
    const auditCase = document.getElementById('audit-case');
    const auditNum = document.getElementById('audit-num');
    const auditSym = document.getElementById('audit-sym');

    // Live Email Validation Checks
    if (emailInputField) {
        emailInputField.addEventListener('input', () => {
            const emailValue = emailInputField.value.trim();
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const isEmailValid = emailPattern.test(emailValue);

            const inputWrapper = emailInputField.closest('.minimal-input-wrapper');

            if (emailValue === '') {
                emailCheckIcon.className = 'input-status-icon';
                inputWrapper.classList.remove('has-error');
            } else if (isEmailValid) {
                emailCheckIcon.className = 'input-status-icon valid';
                inputWrapper.classList.remove('has-error');
            } else {
                emailCheckIcon.className = 'input-status-icon invalid';
            }
        });
    }

    // Submit Step 1 Email Identification Form
    if (emailForm) {
        emailForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const emailValue = emailInputField.value.trim();
            const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            const isEmailValid = emailPattern.test(emailValue);

            const inputWrapper = emailInputField.closest('.minimal-input-wrapper');

            if (!isEmailValid) {
                inputWrapper.classList.add('has-error');
                if (emailErrorHint) emailErrorHint.style.display = 'block';
                return;
            }

            // Move to Step 2 OTP
            if (emailPlaceholder) emailPlaceholder.textContent = emailValue;
            
            // Update Progress Header Indicators
            if (stepInd1 && stepInd2 && bridge1) {
                stepInd1.classList.remove('active');
                stepInd1.classList.add('completed');
                bridge1.classList.add('completed');
                stepInd2.classList.add('active');
            }

            // Update Panel display
            if (paneStep1 && paneStep2) {
                paneStep1.classList.remove('active');
                paneStep2.classList.add('active');
            }

            // Run countdown clock (60s)
            runOtpTimer(60);

            // Auto focus first OTP cell input
            setTimeout(() => {
                if (otpCells[0]) otpCells[0].focus();
            }, 100);
        });
    }

    // OTP Code Focus Jumps
    otpCells.forEach((cell, idx) => {
        cell.addEventListener('input', (e) => {
            const val = e.target.value;
            // numeric cells only
            e.target.value = val.replace(/[^0-9]/g, '');

            if (e.target.value !== '' && idx < otpCells.length - 1) {
                otpCells[idx + 1].focus();
            }
        });

        cell.addEventListener('keydown', (e) => {
            if (e.key === 'Backspace' && cell.value === '' && idx > 0) {
                otpCells[idx - 1].focus();
            }
        });
    });

    // Countdown Clock Timer Loop
    let otpCountdownClock = null;
    function runOtpTimer(durationSeconds) {
        clearInterval(otpCountdownClock);
        let remaining = durationSeconds;

        if (otpResendBtn) {
            otpResendBtn.disabled = true;
            otpResendBtn.textContent = `Resend Code (${remaining}s)`;
        }

        otpCountdownClock = setInterval(() => {
            remaining--;
            
            const mins = Math.floor(remaining / 60);
            const secs = remaining % 60;
            
            if (otpTimerLabel) {
                otpTimerLabel.textContent = `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
            }

            if (otpResendBtn) {
                otpResendBtn.textContent = `Resend Code (${remaining}s)`;
            }

            if (remaining <= 0) {
                clearInterval(otpCountdownClock);
                if (otpResendBtn) {
                    otpResendBtn.disabled = false;
                    otpResendBtn.textContent = "Resend Code";
                }
            }
        }, 1000);
    }

    // Resend OTP Action
    if (otpResendBtn) {
        otpResendBtn.addEventListener('click', () => {
            runOtpTimer(60);
            alert("🔒 Transmitted security OTP seed successfully!");
        });
    }

    // Submit Step 2 OTP Verification Form
    if (otpVerifyForm) {
        otpVerifyForm.addEventListener('submit', (e) => {
            e.preventDefault();
            
            // Verify code filled
            let collectedOtp = "";
            otpCells.forEach(cell => collectedOtp += cell.value);

            if (collectedOtp.length < 6) {
                alert("⚠️ Input verification key digits fully.");
                return;
            }

            // OTP verified (Simulate progress) -> Step 3 New Password
            clearInterval(otpCountdownClock);

            // Update Progress Header Indicators
            if (stepInd2 && stepInd3 && bridge2) {
                stepInd2.classList.remove('active');
                stepInd2.classList.add('completed');
                bridge2.classList.add('completed');
                stepInd3.classList.add('active');
            }

            // Update Pane Display
            if (paneStep2 && paneStep3) {
                paneStep2.classList.remove('active');
                paneStep3.classList.add('active');
            }

            // Focus new password input
            setTimeout(() => {
                if (pwdInput) pwdInput.focus();
            }, 100);
        });
    }

    // Live Password Strength Gauge Checks
    if (pwdInput) {
        pwdInput.addEventListener('input', () => {
            const pwdVal = pwdInput.value;

            // Audit checks
            const hasLength = pwdVal.length >= 8;
            const hasUpper = /[A-Z]/.test(pwdVal);
            const hasNumber = /[0-9]/.test(pwdVal);
            const hasSpecialSymbol = /[^A-Za-z0-9]/.test(pwdVal);

            // Toggle checkbox indicators
            if (auditLen) auditLen.classList.toggle('valid', hasLength);
            if (auditCase) auditCase.classList.toggle('valid', hasUpper);
            if (auditNum) auditNum.classList.toggle('valid', hasNumber);
            if (auditSym) auditSym.classList.toggle('valid', hasSpecialSymbol);

            // Score evaluation
            let score = 0;
            if (pwdVal !== '') {
                if (hasLength) score++;
                if (hasUpper) score++;
                if (hasNumber) score++;
                if (hasSpecialSymbol) score++;
            }

            // Color / Width configurations
            let widthPercent = 0;
            let themeColor = '';
            let labelText = 'None';

            if (score === 0 && pwdVal !== '') {
                widthPercent = 15;
                themeColor = '#86868b'; // standard grey
                labelText = 'Vulnerable';
            } else if (score === 1) {
                widthPercent = 25;
                themeColor = '#86868b'; // standard grey
                labelText = 'Weak';
            } else if (score === 2) {
                widthPercent = 50;
                themeColor = '#86868b'; // standard grey
                labelText = 'Medium';
            } else if (score === 3) {
                widthPercent = 75;
                themeColor = '#48484a'; // charcoal
                labelText = 'Strong';
            } else if (score === 4) {
                widthPercent = 100;
                themeColor = '#1d1d1f'; // solid black
                labelText = 'Secure';
            }

            if (pwdStrengthBarFill) {
                pwdStrengthBarFill.style.width = `${widthPercent}%`;
                pwdStrengthBarFill.style.backgroundColor = themeColor;
            }
            if (pwdStrengthLabel) {
                pwdStrengthLabel.textContent = labelText;
                pwdStrengthLabel.style.color = themeColor;
            }
        });
    }

    // Submit Step 3 Password Reset Form
    if (pwdResetForm) {
        pwdResetForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const pwdVal = pwdInput.value;
            const confirmVal = pwdConfirmInput.value;

            // Audit checks met
            const hasLength = pwdVal.length >= 8;
            const hasUpper = /[A-Z]/.test(pwdVal);
            const hasNumber = /[0-9]/.test(pwdVal);
            const hasSpecialSymbol = /[^A-Za-z0-9]/.test(pwdVal);

            if (!hasLength || !hasUpper || !hasNumber || !hasSpecialSymbol) {
                alert("⚠️ New key does not meet security criteria checklist.");
                return;
            }

            // Match check
            const inputWrapper = pwdConfirmInput.closest('.minimal-input-wrapper');
            if (pwdVal !== confirmVal) {
                inputWrapper.classList.add('has-error');
                return;
            } else {
                inputWrapper.classList.remove('has-error');
            }

            // Credentials successfully updated -> reset to default Identification step
            alert("🔑 Security credentials saved successfully! Access active.");

            // Reset forms and states
            pwdResetForm.reset();
            emailForm.reset();
            otpVerifyForm.reset();

            if (pwdStrengthBarFill) pwdStrengthBarFill.style.width = '0%';
            if (pwdStrengthLabel) {
                pwdStrengthLabel.textContent = 'None';
                pwdStrengthLabel.style.color = '';
            }

            const auditCheckboxes = [auditLen, auditCase, auditNum, auditSym];
            auditCheckboxes.forEach(item => {
                if (item) item.classList.remove('valid');
            });

            // Reset Indicators
            const indicators = [stepInd1, stepInd2, stepInd3];
            const bridges = [bridge1, bridge2];
            indicators.forEach(ind => ind.classList.remove('completed', 'active'));
            bridges.forEach(b => b.classList.remove('completed'));

            if (stepInd1) stepInd1.classList.add('active');

            // Reset step Panes
            const panes = [paneStep1, paneStep2, paneStep3];
            panes.forEach(p => p.classList.remove('active'));
            if (paneStep1) paneStep1.classList.add('active');
        });
    }


    // --- 4. PORTFOLIO FILTER GALLERY ---
    const filterTabButtons = document.querySelectorAll('.portfolio-controls-minimal .filter-tab-btn');
    const masonryBlocks = document.querySelectorAll('#portfolio-masonry .portfolio-card-minimal');

    filterTabButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterTabButtons.forEach(b => b.classList.remove('active'));
            btn.classList.add('active');

            const selectedFilter = btn.getAttribute('data-filter');

            masonryBlocks.forEach(block => {
                const category = block.getAttribute('data-category');

                if (selectedFilter === 'all' || category === selectedFilter) {
                    block.style.display = 'inline-block';
                    setTimeout(() => {
                        block.style.opacity = 1;
                        block.style.transform = 'scale(1)';
                    }, 50);
                } else {
                    block.style.opacity = 0;
                    block.style.transform = 'scale(0.96)';
                    setTimeout(() => {
                        block.style.display = 'none';
                    }, 200);
                }
            });
        });
    });


    // --- 5. DIGITAL MARKETING ROI ANALYTICS WIDGET ---
    const roiSpendSlider = document.getElementById('roi-slider-spend');
    const spendLabel = document.getElementById('roi-spend-lbl');
    
    // Outputs display
    const reachDisplay = document.getElementById('val-roi-reach');
    const convDisplay = document.getElementById('val-roi-conversions');
    const roiRatioDisplay = document.getElementById('val-roi-ratio');

    // Chart elements
    const roiLinePath = document.getElementById('roi-line-path');
    const roiTargetNode = document.getElementById('roi-chart-node');

    const maxBudgetSliderVal = 50000;
    const chartBaselineY = 160;

    function updateROIPredictor() {
        const budgetValue = parseInt(roiSpendSlider.value);
        if (spendLabel) spendLabel.textContent = `$${budgetValue.toLocaleString()}`;

        // Predictor Metrics calculations
        const estReach = budgetValue * 50; // Impressions
        const estConversions = Math.floor(budgetValue * 0.75); // Action
        const estRevenue = estConversions * 15;
        const estRoasPercentage = Math.floor(((estRevenue - budgetValue) / budgetValue) * 100);

        // Update displays
        if (reachDisplay) reachDisplay.textContent = formatMetricLabel(estReach);
        if (convDisplay) convDisplay.textContent = formatMetricLabel(estConversions);
        if (roiRatioDisplay) roiRatioDisplay.textContent = `${estRoasPercentage}%`;

        // SVG Dynamic Line Chart curve updates
        // Math coordinates:
        const scalingRatio = budgetValue / maxBudgetSliderVal;
        
        // Compute curve coordinates dynamically relative to scalingRatio
        const controlY1 = chartBaselineY - scalingRatio * 30;
        const controlY2 = chartBaselineY - scalingRatio * 75;
        const peakY = chartBaselineY - scalingRatio * 115;

        // Path blueprint updates
        if (roiLinePath) {
            roiLinePath.setAttribute('d', `M 30 160 C 130 ${controlY1}, 230 ${controlY2}, 430 ${peakY}`);
        }
        
        // Node marker coordinate updates
        if (roiTargetNode) {
            roiTargetNode.setAttribute('cx', 430);
            roiTargetNode.setAttribute('cy', peakY);
        }
    }

    function formatMetricLabel(value) {
        if (value >= 1000000) {
            return (value / 1000000).toFixed(1) + 'M';
        }
        if (value >= 1000) {
            return (value / 1000).toFixed(0) + 'K';
        }
        return value.toString();
    }

    if (roiSpendSlider) {
        roiSpendSlider.addEventListener('input', updateROIPredictor);
    }

    // Initialize Predictor Widget
    updateROIPredictor();


    // --- 6. REQUEST DESIGN PORTAL POPUP MODAL ---
    const modalOverlay = document.getElementById('design-request-modal');
    const openModalTrigger = document.getElementById('trigger-design-modal');
    const closeModalTrigger = document.getElementById('close-modal-trigger');
    const cancelModalBtn = document.getElementById('btn-cancel-modal');
    const designInquiryForm = document.getElementById('design-inquiry-form');

    function openModal() {
        if (modalOverlay) {
            modalOverlay.classList.add('open');
            document.body.style.overflow = 'hidden';
        }
    }

    function closeModal() {
        if (modalOverlay) {
            modalOverlay.classList.remove('open');
            document.body.style.overflow = '';
        }
    }

    if (openModalTrigger) openModalTrigger.addEventListener('click', openModal);
    if (closeModalTrigger) closeModalTrigger.addEventListener('click', closeModal);
    if (cancelModalBtn) cancelModalBtn.addEventListener('click', closeModal);

    // Overlay outer click
    if (modalOverlay) {
        modalOverlay.addEventListener('click', (e) => {
            if (e.target === modalOverlay) {
                closeModal();
            }
        });
    }

    // Submit inquiry
    if (designInquiryForm) {
        designInquiryForm.addEventListener('submit', (e) => {
            e.preventDefault();

            const operatorName = document.getElementById('m-name').value;
            const selectedCategory = document.getElementById('m-category').value;

            alert(`📥 Request Transmitted! Spec query registered for operator "${operatorName}" under category "${selectedCategory}".`);

            // Reset and close
            designInquiryForm.reset();
            closeModal();
        });
    }

});
