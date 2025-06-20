$(document).ready(function() {
    // Enhanced DataTable initialization
    var table = $('#dataTable').DataTable({
        dom: 'Bfrtip',
        buttons: [
            {
                extend: 'copy',
                className: 'contact-btn',
                text: '<i class="fas fa-copy"></i> Copy'
            },
            {
                extend: 'csv',
                className: 'contact-btn',
                text: '<i class="fas fa-file-csv"></i> CSV'
            },
            {
                extend: 'excel',
                className: 'contact-btn',
                text: '<i class="fas fa-file-excel"></i> Excel'
            },
            {
                extend: 'pdf',
                className: 'contact-btn',
                text: '<i class="fas fa-file-pdf"></i> PDF'
            },
            {
                extend: 'print',
                className: 'contact-btn',
                text: '<i class="fas fa-print"></i> Print'
            }
        ],
        scrollX: true,
        pageLength: 25,
        lengthMenu: [[10, 25, 50, 100, -1], [10, 25, 50, 100, "All"]],
        responsive: true,
        columnDefs: [
            {
                targets: 7, // Hide the Extra column (column with NaN values)
                visible: false
            },
            {
                targets: 0, // Name column
                render: function(data, type, row) {
                    return '<strong>' + data + '</strong>';
                }
            },
            {
                targets: 2, // Office column
                render: function(data, type, row) {
                    // For search and type operations, return original data
                    if (type === 'search' || type === 'type') {
                        return data || '';
                    }
                    
                    // For display, return formatted HTML
                    var badgeClass = data && data.toLowerCase() === 'senator' ? 'senator' : 'representative';
                    return '<span class="office-badge ' + badgeClass + '">' + (data || 'N/A') + '</span>';
                }
            },
            {
                targets: 4, // Party column
                render: function(data, type, row) {
                    // For search and type operations, return original data
                    if (type === 'search' || type === 'type') {
                        return data || '';
                    }
                    
                    // For display, return formatted HTML
                    if (!data || data === 'NaN') return 'N/A';
                    var party = data.toUpperCase();
                    var partyClass = party === 'D' ? 'democrat' : party === 'R' ? 'republican' : 'independent';
                    var partyName = party === 'D' ? 'Democrat' : party === 'R' ? 'Republican' : 'Independent';
                    return '<span class="party-badge ' + partyClass + '">' + party + '</span>';
                }
            },
            {
                targets: 5, // Website column
                render: function(data, type, row) {
                    if (!data || data === 'NaN' || data.trim() === '') {
                        return 'No website available';
                    }
                    return '<a href="' + data + '" target="_blank" class="contact-btn website" title="Visit ' + row[0] + '\'s website">' +
                           '<i class="fas fa-external-link-alt"></i> Website</a>';
                }
            },
            {
                targets: 6, // Phone column
                render: function(data, type, row) {
                    if (!data || data === 'NaN' || data.trim() === '') {
                        return 'No phone available';
                    }
                    var phone = data.replace(/[^\d]/g, '');
                    if (phone.length >= 10) {
                        return '<a href="tel:+1' + phone + '" class="contact-btn phone" title="Call ' + row[0] + '">' +
                               '<i class="fas fa-phone"></i> ' + data + '</a>';
                    }
                    return data;
                }
            },
            {
                targets: 8, // Address column (now column 8 since we're hiding column 7)
                render: function(data, type, row) {
                    var address = data && data !== 'NaN' && data.trim() !== '' ? data : 'Address not available';
                    return '<span class="tooltip" data-tooltip="' + address + '">' +
                           '<i class="fas fa-map-marker-alt"></i> ' + 
                           (address.length > 30 ? address.substring(0, 30) + '...' : address) +
                           '</span>';
                }
            }
        ],
        order: [[0, 'asc']] // Sort by name initially
    });

    // Populate filter dropdowns
    populateFilters(table);    // Custom filter functions
    setupCustomFilters(table);

    // Update stats
    updateStats(table);
    
    // Load shared header for index page
    if (typeof loadHeader === 'function') {
        loadHeader('Congress Call List', 'Contact your representatives • Make your voice heard', 'fas fa-home');
    }
});

function populateFilters(table) {
    // State filter
    var states = [];
    table.column(1).data().unique().sort().each(function(d) {
        if (d && d.trim() !== '') {
            states.push(d);
        }
    });
    
    states.forEach(function(state) {
        $('#stateFilter').append('<option value="' + state + '">' + getStateName(state) + ' (' + state + ')</option>');
    });
}

function setupCustomFilters(table) {
    // Custom search function to handle combined filters
    $.fn.dataTable.ext.search.push(
        function(settings, data, dataIndex) {
            // Only apply to our specific table
            if (settings.nTable !== table.table().node()) {
                return true;
            }

            var stateFilter = $('#stateFilter').val();
            var officeFilter = $('#officeFilter').val();
            var partyFilter = $('#partyFilter').val();
            var nameFilter = $('#nameSearch').val().toLowerCase();

            // Extract data values
            var name = data[0] || '';
            var state = data[1] || '';
            var office = data[2] || '';
            var party = data[4] || '';

            // Extract office value from HTML if present
            if (office.includes('<span')) {
                var tempDiv = document.createElement('div');
                tempDiv.innerHTML = office;
                office = tempDiv.textContent || tempDiv.innerText || '';
            }
            office = office.trim();

            // Extract party value from HTML if present
            if (party.includes('<span')) {
                var tempDiv = document.createElement('div');
                tempDiv.innerHTML = party;
                party = tempDiv.textContent || tempDiv.innerText || '';
            }
            party = party.trim();

            // Apply filters
            if (stateFilter && state !== stateFilter) {
                return false;
            }

            if (officeFilter && office !== officeFilter) {
                return false;
            }

            if (partyFilter && party !== partyFilter) {
                return false;
            }

            if (nameFilter && !name.toLowerCase().includes(nameFilter)) {
                return false;
            }

            return true;
        }
    );

    // State filter
    $('#stateFilter').on('change', function() {
        table.draw();
        updateStats(table);
    });

    // Office filter
    $('#officeFilter').on('change', function() {
        table.draw();
        updateStats(table);
    });

    // Party filter
    $('#partyFilter').on('change', function() {
        table.draw();
        updateStats(table);
    });

    // Name search
    $('#nameSearch').on('keyup', function() {
        table.draw();
        updateStats(table);
    });
}

function clearAllFilters() {
    // Clear all filter dropdown values
    $('#stateFilter').val('');
    $('#officeFilter').val('');
    $('#partyFilter').val('');
    $('#nameSearch').val('');
    
    // Redraw the table to show all data
    if ($.fn.DataTable.isDataTable('#dataTable')) {
        $('#dataTable').DataTable().draw();
        updateStats($('#dataTable').DataTable());
    }
}

function updateStats(table) {
    var info = table.page.info();
    var filteredData = table.rows({ search: 'applied' }).data();
    
    // Count by office
    var senators = 0;
    var representatives = 0;
    
    // Count by party
    var democrats = 0;
    var republicans = 0;
    var independents = 0;
    
    filteredData.each(function(row) {
        // Office counting (column 2)
        var office = row[2] || '';
        if (office.toLowerCase().includes('senator')) {
            senators++;
        } else if (office.toLowerCase().includes('representative')) {
            representatives++;
        }
        
        // Party counting (column 4)
        var party = row[4] || '';
        if (party.includes('<span')) {
            var tempDiv = document.createElement('div');
            tempDiv.innerHTML = party;
            party = tempDiv.textContent || tempDiv.innerText || '';
        }
        party = party.trim().toUpperCase();
        
        if (party === 'D') {
            democrats++;
        } else if (party === 'R') {
            republicans++;
        } else {
            independents++;
        }
    });
    
    // Update display
    $('#total-count .stat-number').text(info.recordsDisplay);
    $('#senator-count .stat-number').text(senators);
    $('#rep-count .stat-number').text(representatives);
    $('#dem-count .stat-number').text(democrats);
    $('#rep-party-count .stat-number').text(republicans);
    $('#ind-count .stat-number').text(independents);
}

function getStateName(abbr) {
    var states = {
        'AL': 'Alabama', 'AK': 'Alaska', 'AZ': 'Arizona', 'AR': 'Arkansas', 'CA': 'California',
        'CO': 'Colorado', 'CT': 'Connecticut', 'DE': 'Delaware', 'FL': 'Florida', 'GA': 'Georgia',
        'HI': 'Hawaii', 'ID': 'Idaho', 'IL': 'Illinois', 'IN': 'Indiana', 'IA': 'Iowa',
        'KS': 'Kansas', 'KY': 'Kentucky', 'LA': 'Louisiana', 'ME': 'Maine', 'MD': 'Maryland',
        'MA': 'Massachusetts', 'MI': 'Michigan', 'MN': 'Minnesota', 'MS': 'Mississippi', 'MO': 'Missouri',
        'MT': 'Montana', 'NE': 'Nebraska', 'NV': 'Nevada', 'NH': 'New Hampshire', 'NJ': 'New Jersey',
        'NM': 'New Mexico', 'NY': 'New York', 'NC': 'North Carolina', 'ND': 'North Dakota', 'OH': 'Ohio',
        'OK': 'Oklahoma', 'OR': 'Oregon', 'PA': 'Pennsylvania', 'RI': 'Rhode Island', 'SC': 'South Carolina',
        'SD': 'South Dakota', 'TN': 'Tennessee', 'TX': 'Texas', 'UT': 'Utah', 'VT': 'Vermont',
        'VA': 'Virginia', 'WA': 'Washington', 'WV': 'West Virginia', 'WI': 'Wisconsin', 'WY': 'Wyoming',
        'DC': 'District of Columbia'
    };
    return states[abbr] || abbr;
}

// Add click tracking for contact buttons
$(document).on('click', '.contact-btn', function() {
    var action = $(this).hasClass('phone') ? 'phone_call' : 
                 $(this).hasClass('website') ? 'website_visit' : 'email_send';
    
    // Use trackAction from common.js (note: changed from trackEvent to trackAction)
    if (typeof trackAction === 'function') {
        trackAction(action, {
            category: 'Contact',
            label: $(this).closest('tr').find('td:first').text(),
            custom: {
                contact_method: action
            }
        });
    }
});
