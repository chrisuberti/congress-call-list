/* Call Scripts Page JavaScript */

// Call scripts data
const callScripts = {
    publicLands: {
        title: "Stop Mandated Timber Harvests on Public Lands",
        content: `Hello, my name is [YOUR NAME] and I'm a constituent from [YOUR CITY/STATE]. I'm calling to urge [Senator/Representative NAME] to oppose HR 1, specifically Sections 80308 and 80309 that mandate increased timber harvests on our National Forest and BLM lands.

These provisions are deeply concerning because they:
• Mandate a 25% increase in timber harvest volumes above 2020-2024 averages
• Require 20+ year logging contracts that lock in unsustainable practices
• Apply to all National Forest lands except Wilderness areas
• Override current forest management plans and scientific recommendations
• Prioritize timber revenue over forest health and conservation

Our public forests provide essential services:
• Carbon storage critical for climate stability
• Watershed protection for clean drinking water
• Wildlife habitat for endangered species
• Recreation opportunities generating $45 billion annually
• Fire prevention through science-based management

Mandating increased logging regardless of ecological conditions puts short-term revenue ahead of long-term forest health. These lands belong to all Americans and should be managed sustainably, not exploited for maximum timber extraction.

I urge [Senator/Representative NAME] to vote NO on HR 1 and support amendments removing Sections 80308 and 80309. Our forests need science-based management, not politically-mandated logging quotas.

Thank you for your time. Can you tell me [Senator/Representative NAME]'s position on protecting our public forests from mandated logging increases?`
    },
    environment: {
        title: "Protect Climate and Conservation Funding",
        content: `Hello, my name is [YOUR NAME] and I'm a constituent from [YOUR CITY/STATE]. I'm calling to express strong opposition to HR 1's Section 41001 that would eliminate billions in climate and conservation funding from the Inflation Reduction Act.

This provision would rescind critical funding for:
• Forest Service climate resilience programs (Section 23001)
• NOAA facilities and marine sanctuary improvements (Section 40002)
• National Park Service and Bureau of Land Management conservation efforts
• Clean energy and environmental technology development
• Climate adaptation and resilience programs

These programs are essential because:
• They help communities adapt to climate change impacts
• They protect natural areas that provide clean air and water
• They support American leadership in clean energy innovation
• They create jobs in the growing green economy
• They help meet our international climate commitments

Eliminating this funding doesn't save money—it costs us more in the long run through climate damage, health costs, and missed economic opportunities. We've already seen the devastating costs of climate inaction through extreme weather, droughts, and flooding.

The Inflation Reduction Act represents the largest federal investment in climate action in American history. Reversing it now would abandon our commitment to future generations and cede clean energy leadership to other countries.

I urge [Senator/Representative NAME] to vote NO on HR 1 and protect these vital climate and conservation investments.

Can you tell me where [Senator/Representative NAME] stands on maintaining federal climate action funding?`
    },
    oversight: {
        title: "Protect Federal Employee Civil Service Rights",
        content: `Hello, my name is [YOUR NAME] and I'm a constituent from [YOUR CITY/STATE]. I'm calling about HR 1's Section 90002 that would undermine civil service protections for federal employees by creating "at-will" employment options.

This provision allows federal employees to be terminated "for good cause, bad cause, or no cause at all," which would:
• Eliminate merit-based employment in government
• Open the door to political retaliation and corruption
• Discourage qualified professionals from federal service
• Undermine the non-partisan expertise that keeps government functioning
• Create instability that harms government efficiency and effectiveness

Civil service protections exist for good reasons:
• They ensure government decisions are based on expertise, not politics
• They protect whistleblowers who report waste, fraud, and abuse
• They attract qualified professionals to public service
• They provide continuity as administrations change
• They prevent corruption and political favoritism

Federal employees serve all Americans regardless of party. They inspect our food, protect our borders, conduct scientific research, and provide essential services. They deserve job security based on merit and performance, not political whims.

At-will employment would politicize the federal workforce and harm government effectiveness. We need competent, professional civil servants focused on serving the public, not worrying about arbitrary termination.

I urge [Senator/Representative NAME] to vote NO on HR 1 and support maintaining merit-based civil service protections.

What is [Senator/Representative NAME]'s position on protecting federal employee rights and maintaining professional government service?`
    },
    healthcare: {
        title: "Oppose Healthcare Funding Restrictions",
        content: `Hello, my name is [YOUR NAME] and I'm a constituent from [YOUR CITY/STATE]. I'm calling to oppose HR 1's healthcare provisions, specifically Sections 44110 and 44125, that would restrict Medicaid and CHIP funding and limit healthcare access.

These sections would:
• Prohibit federal Medicaid/CHIP funding for individuals without verified citizenship (Section 44110)
• Eliminate federal funding for certain medical procedures (Section 44125)
• Create additional barriers to healthcare access for vulnerable populations
• Increase administrative burdens on states and healthcare providers
• Potentially leave children and families without necessary medical care

These restrictions are harmful because:
• Healthcare is a basic human need regardless of immigration status
• Untreated illnesses become more expensive public health emergencies
• Children shouldn't suffer for their parents' documentation status
• These policies would overwhelm emergency rooms with preventable cases
• Public health protections benefit everyone in our communities

Medicaid and CHIP provide essential healthcare services:
• Preventive care that catches problems early
• Treatment for chronic conditions like diabetes and heart disease
• Mental health services for children and families
• Emergency care that saves lives
• Maternal care that protects mothers and babies

Restricting healthcare funding doesn't save money—it shifts costs to emergency rooms and creates worse health outcomes. It also undermines public health by discouraging people from seeking treatment for contagious diseases.

I urge [Senator/Representative NAME] to vote NO on HR 1 and support maintaining healthcare access for all people in our communities, regardless of immigration status.

What is [Senator/Representative NAME]'s position on protecting healthcare access and opposing discriminatory funding restrictions?`
    }
};

// Modal functions
function openScript(scriptKey) {
    const script = callScripts[scriptKey];
    document.getElementById('modalTitle').textContent = script.title;
    document.getElementById('modalScript').textContent = script.content;
    document.getElementById('scriptModal').style.display = 'block';
    
    // Track modal open event
    if (typeof trackEvent === 'function') {
        trackEvent('script_modal_opened', {
            script_type: scriptKey,
            script_title: script.title
        });
    }
}

function closeModal() {
    document.getElementById('scriptModal').style.display = 'none';
}

// Copy script functions
function copyScript(scriptKey) {
    const script = callScripts[scriptKey];
    copyToClipboard(script.content, 'Call script copied to clipboard!');
    
    // Track copy event
    if (typeof trackEvent === 'function') {
        trackEvent('script_copied', {
            script_type: scriptKey,
            script_title: script.title,
            copy_type: 'preview'
        });
    }
}

function copyFullScript() {
    const scriptText = document.getElementById('modalScript').textContent;
    copyToClipboard(scriptText, 'Full script copied to clipboard!');
    
    // Track full script copy event
    if (typeof trackEvent === 'function') {
        trackEvent('script_copied', {
            copy_type: 'full_modal'
        });
    }
}

// Initialize page
document.addEventListener('DOMContentLoaded', function() {
    // Close modal when clicking outside
    window.onclick = function(event) {
        const modal = document.getElementById('scriptModal');
        if (event.target === modal) {
            closeModal();
        }
    };
    
    // Add keyboard support for modal
    document.addEventListener('keydown', function(event) {
        if (event.key === 'Escape') {
            closeModal();
        }
    });
    
    // Add slide in animation styles
    const style = document.createElement('style');
    style.textContent = `
        @keyframes slideInRight {
            from {
                transform: translateX(100%);
                opacity: 0;
            }
            to {
                transform: translateX(0);
                opacity: 1;
            }
        }
    `;
    document.head.appendChild(style);
    
    // Track page view
    if (typeof trackEvent === 'function') {
        trackEvent('page_view', {
            page: 'call_scripts',
            page_title: 'Call Scripts'
        });
    }
    loadHeader('Call Scripts', 'Ready-to-use scripts to contact your representatives • Stand up for your values', 'fas fa-phone-alt');

});
