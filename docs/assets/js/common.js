// Common JavaScript utilities and Google Analytics setup

// Google Analytics Configuration
window.dataLayer = window.dataLayer || [];
function gtag(){dataLayer.push(arguments);}
gtag('js', new Date());

// Analytics tracking ID - public by design, safe to be visible
const GA_TRACKING_ID = 'G-SG3DFX20BN';
gtag('config', GA_TRACKING_ID);

// Enhanced tracking function for user interactions
function trackAction(action, details = {}) {
    // Send to Google Analytics
    gtag('event', action, {
        event_category: details.category || 'User Interaction',
        event_label: details.label || '',
        value: details.value || null,
        custom_parameters: details.custom || {}
    });
    
    // Optional console logging for development
    if (window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') {
        console.log('Analytics Event:', action, details);
    }
}

// Navigation management
function initializeNavigation(currentPage) {
    const navLinks = document.querySelectorAll('nav a');
    navLinks.forEach(link => {
        // Remove any existing active class
        link.classList.remove('active');
        
        // Add active class to current page
        if (link.getAttribute('href') === currentPage) {
            link.classList.add('active');
        }
        
        // Track navigation clicks
        link.addEventListener('click', function(e) {
            trackAction('navigation_click', {
                category: 'Navigation',
                label: this.getAttribute('href'),
                custom: {
                    from_page: currentPage,
                    to_page: this.getAttribute('href')
                }
            });
        });
    });
}

// Copy text to clipboard utility
function copyToClipboard(text, successMessage = 'Copied to clipboard!') {
    if (navigator.clipboard && window.isSecureContext) {
        return navigator.clipboard.writeText(text).then(() => {
            showNotification(successMessage, 'success');
            return true;
        }).catch(err => {
            console.error('Failed to copy text: ', err);
            fallbackCopyTextToClipboard(text, successMessage);
            return false;
        });
    } else {
        fallbackCopyTextToClipboard(text, successMessage);
        return Promise.resolve(true);
    }
}

// Fallback copy method for older browsers
function fallbackCopyTextToClipboard(text, successMessage) {
    const textArea = document.createElement('textarea');
    textArea.value = text;
    textArea.style.top = '0';
    textArea.style.left = '0';
    textArea.style.position = 'fixed';
    
    document.body.appendChild(textArea);
    textArea.focus();
    textArea.select();
    
    try {
        const successful = document.execCommand('copy');
        if (successful) {
            showNotification(successMessage, 'success');
        } else {
            showNotification('Failed to copy text', 'error');
        }
    } catch (err) {
        console.error('Fallback: Oops, unable to copy', err);
        showNotification('Failed to copy text', 'error');
    }
    
    document.body.removeChild(textArea);
}

// Simple notification system
function showNotification(message, type = 'info') {
    // Remove any existing notifications
    const existingNotifications = document.querySelectorAll('.notification');
    existingNotifications.forEach(notification => notification.remove());
    
    // Create notification element
    const notification = document.createElement('div');
    notification.className = `notification notification-${type}`;
    notification.textContent = message;
    
    // Style the notification
    Object.assign(notification.style, {
        position: 'fixed',
        top: '20px',
        right: '20px',
        padding: '12px 20px',
        borderRadius: '6px',
        color: 'white',
        fontWeight: '500',
        zIndex: '10000',
        transform: 'translateX(100%)',
        transition: 'transform 0.3s ease',
        maxWidth: '300px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
    });
    
    // Set background color based on type
    switch (type) {
        case 'success':
            notification.style.background = '#059669';
            break;
        case 'error':
            notification.style.background = '#dc2626';
            break;
        case 'warning':
            notification.style.background = '#f59e0b';
            break;
        default:
            notification.style.background = '#1e40af';
    }
    
    // Add to page
    document.body.appendChild(notification);
    
    // Animate in
    setTimeout(() => {
        notification.style.transform = 'translateX(0)';
    }, 100);
    
    // Auto remove after 3 seconds
    setTimeout(() => {
        notification.style.transform = 'translateX(100%)';
        setTimeout(() => {
            if (notification.parentNode) {
                notification.parentNode.removeChild(notification);
            }
        }, 300);
    }, 3000);
}

// Initialize common functionality when DOM is ready
document.addEventListener('DOMContentLoaded', function() {
    // Track page view
    trackAction('page_view', {
        category: 'Page View',
        label: window.location.pathname,
        custom: {
            title: document.title,
            referrer: document.referrer
        }
    });
    
    // Add copy button functionality to script cards
    const scriptCards = document.querySelectorAll('.script-card');
    scriptCards.forEach(card => {
        const copyBtn = card.querySelector('.copy-btn');
        if (copyBtn) {
            copyBtn.addEventListener('click', function() {
                const scriptText = card.querySelector('.script-content').textContent;
                copyToClipboard(scriptText);
                
                trackAction('script_copy', {
                    category: 'Call Script',
                    label: card.querySelector('h3').textContent,
                    custom: {
                        script_length: scriptText.length
                    }
                });
            });
        }
    });
});

// Export functions for use in other scripts
window.CongressCallList = {
    trackAction,
    initializeNavigation,
    copyToClipboard,
    showNotification
};
