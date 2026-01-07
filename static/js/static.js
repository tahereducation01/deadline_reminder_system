// Luxury Deadline Reminder System - JavaScript

document.addEventListener('DOMContentLoaded', function() {
    // Initialize tooltips and animations
    initializeLuxuryEffects();
    
    // Form validation
    initializeFormValidation();
    
    // Task management
    initializeTaskManagement();
    
    // Real-time clock
    initializeClock();
    
    // Real-time countdown updates
    initializeCountdowns();
});

function initializeLuxuryEffects() {
    // Add hover effects to cards
    const cards = document.querySelectorAll('.luxury-card, .task-card');
    cards.forEach(card => {
        card.addEventListener('mouseenter', function() {
            this.style.transform = 'translateY(-5px)';
        });
        
        card.addEventListener('mouseleave', function() {
            this.style.transform = 'translateY(0)';
        });
    });
    
    // Add sparkle effect to buttons
    const buttons = document.querySelectorAll('.btn-luxury');
    buttons.forEach(button => {
        button.addEventListener('mouseenter', function() {
            this.style.background = 'linear-gradient(135deg, #ff1493, #ff69b4)';
        });
        
        button.addEventListener('mouseleave', function() {
            this.style.background = 'linear-gradient(135deg, #ff69b4, #b76e79)';
        });
    });
}

function initializeFormValidation() {
    const forms = document.querySelectorAll('form');
    
    forms.forEach(form => {
        form.addEventListener('submit', function(e) {
            const requiredFields = this.querySelectorAll('[required]');
            let isValid = true;
            
            requiredFields.forEach(field => {
                if (!field.value.trim()) {
                    isValid = false;
                    showFieldError(field, 'This field is required');
                } else {
                    clearFieldError(field);
                }
            });
            
            // Password confirmation validation
            const password = this.querySelector('#password');
            const confirmPassword = this.querySelector('#confirm_password');
            
            if (password && confirmPassword) {
                if (password.value !== confirmPassword.value) {
                    isValid = false;
                    showFieldError(confirmPassword, 'Passwords do not match');
                }
            }
            
            if (!isValid) {
                e.preventDefault();
                showFlashMessage('Please fill all required fields correctly', 'error');
            }
        });
    });
}

function showFieldError(field, message) {
    clearFieldError(field);
    field.style.borderColor = '#ff6b6b';
    
    const errorDiv = document.createElement('div');
    errorDiv.className = 'field-error';
    errorDiv.style.color = '#ff6b6b';
    errorDiv.style.fontSize = '0.8rem';
    errorDiv.style.marginTop = '0.3rem';
    errorDiv.textContent = message;
    
    field.parentNode.appendChild(errorDiv);
}

function clearFieldError(field) {
    field.style.borderColor = '';
    const existingError = field.parentNode.querySelector('.field-error');
    if (existingError) {
        existingError.remove();
    }
}

function initializeTaskManagement() {
    // Auto-hide flash messages after 5 seconds
    const flashMessages = document.querySelectorAll('.flash-message');
    flashMessages.forEach(message => {
        setTimeout(() => {
            message.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => message.remove(), 300);
        }, 5000);
    });
    
    // Task completion with confirmation for dashboard
    const doneButtons = document.querySelectorAll('.btn-success');
    doneButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const taskTitle = this.closest('.task-card').querySelector('.task-title').textContent;
            if (!confirm(`Mark "${taskTitle}" as completed? 🌸`)) {
                e.preventDefault();
            }
        });
    });
    
    // Delete task with confirmation
    const deleteButtons = document.querySelectorAll('.btn-danger');
    deleteButtons.forEach(button => {
        button.addEventListener('click', function(e) {
            const taskTitle = this.closest('.task-card').querySelector('.task-title').textContent;
            if (!confirm(`Are you sure you want to delete "${taskTitle}"?`)) {
                e.preventDefault();
            }
        });
    });
}

function initializeClock() {
    function updateClock() {
        const now = new Date();
        const timeString = now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: true
        });
        
        const dateString = now.toLocaleDateString('en-US', {
            weekday: 'long',
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
        
        const clockElement = document.getElementById('live-clock');
        if (clockElement) {
            clockElement.innerHTML = `
                <div style="text-align: center; padding: 1rem;">
                    <div style="font-size: 2rem; color: var(--rose-gold); font-weight: bold;">
                        ${timeString}
                    </div>
                    <div style="color: var(--dusty-rose);">
                        ${dateString}
                    </div>
                </div>
            `;
        }
    }
    
    updateClock();
    setInterval(updateClock, 1000);
}

function initializeCountdowns() {
    function updateAllCountdowns() {
        const countdownElements = document.querySelectorAll('[data-deadline]');
        
        countdownElements.forEach(element => {
            const deadline = new Date(element.getAttribute('data-deadline'));
            const now = new Date();
            const timeDiff = deadline - now;
            
            if (timeDiff <= 0) {
                // Task is overdue
                element.innerHTML = createOverdueCountdown();
                return;
            }
            
            const days = Math.floor(timeDiff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((timeDiff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((timeDiff % (1000 * 60 * 60)) / (1000 * 60));
            const seconds = Math.floor((timeDiff % (1000 * 60)) / 1000);
            
            element.innerHTML = createCountdownHTML(days, hours, minutes, seconds, timeDiff);
            
            // Update badge status
            updateCountdownBadge(element, days, hours, minutes);
        });
    }
    
    function createCountdownHTML(days, hours, minutes, seconds, totalTime) {
        const isUrgent = totalTime < 24 * 60 * 60 * 1000; // Less than 24 hours
        
        return `
            <div class="countdown-container ${isUrgent ? 'urgent' : ''}">
                <div style="text-align: center; color: var(--rose-gold); font-weight: bold; margin-bottom: 0.5rem;">
                    ⏰ Time Remaining
                </div>
                <div class="countdown-timer">
                    <div class="countdown-unit">
                        <span class="countdown-value">${days.toString().padStart(2, '0')}</span>
                        <span class="countdown-label">Days</span>
                    </div>
                    <div class="countdown-unit">
                        <span class="countdown-value">${hours.toString().padStart(2, '0')}</span>
                        <span class="countdown-label">Hours</span>
                    </div>
                    <div class="countdown-unit">
                        <span class="countdown-value">${minutes.toString().padStart(2, '0')}</span>
                        <span class="countdown-label">Minutes</span>
                    </div>
                    <div class="countdown-unit">
                        <span class="countdown-value">${seconds.toString().padStart(2, '0')}</span>
                        <span class="countdown-label">Seconds</span>
                    </div>
                </div>
                ${isUrgent ? '<div style="text-align: center; color: #ff6b6b; font-size: 0.9rem; margin-top: 0.5rem;">🚨 Urgent!</div>' : ''}
            </div>
        `;
    }
    
    function createOverdueCountdown() {
        return `
            <div class="countdown-container overdue">
                <div style="text-align: center; font-weight: bold; margin-bottom: 0.5rem;">
                    ⚠️ Overdue!
                </div>
                <div style="text-align: center; font-size: 1.2rem;">
                    Please complete this task immediately
                </div>
            </div>
        `;
    }
    
    function updateCountdownBadge(element, days, hours, minutes) {
        let badge = element.closest('.task-card').querySelector('.countdown-badge');
        if (!badge) {
            badge = document.createElement('div');
            badge.className = 'countdown-badge';
            element.closest('.task-card').appendChild(badge);
        }
        
        if (days === 0 && hours === 0 && minutes < 60) {
            badge.className = 'countdown-badge badge-urgent';
            badge.textContent = 'URGENT';
        } else if (days === 0 && hours < 24) {
            badge.className = 'countdown-badge badge-urgent';
            badge.textContent = 'SOON';
        } else {
            badge.className = 'countdown-badge badge-normal';
            badge.textContent = 'ON TIME';
        }
    }
    
    // Initial update
    updateAllCountdowns();
    
    // Update every second
    setInterval(updateAllCountdowns, 1000);
}

function showFlashMessage(message, type = 'success') {
    const flashContainer = document.querySelector('.flash-messages') || createFlashContainer();
    
    const flashMessage = document.createElement('div');
    flashMessage.className = `flash-message flash-${type}`;
    flashMessage.textContent = message;
    
    flashContainer.appendChild(flashMessage);
    
    setTimeout(() => {
        flashMessage.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => flashMessage.remove(), 300);
    }, 5000);
}

function createFlashContainer() {
    const container = document.createElement('div');
    container.className = 'flash-messages';
    document.body.appendChild(container);
    return container;
}

// Add CSS for slideOut animation
const style = document.createElement('style');
style.textContent = `
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(100%);
            opacity: 0;
        }
    }
    
    .field-error {
        color: #ff6b6b;
        font-size: 0.8rem;
        margin-top: 0.3rem;
    }
`;
document.head.appendChild(style);