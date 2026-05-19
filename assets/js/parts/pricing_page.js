import { Modal } from 'bootstrap';

const VAT_RATE = 1.23;

const pricingPage = () => {
    initSlider();
    initModuleToggles();
    initModuleNav();
    initTrialButton();
};

function initSlider() {
    const range = document.getElementById('studentRange');
    const input = document.getElementById('studentCount');
    const tooltip = document.getElementById('rangeTooltip');

    if (!range || !input || !tooltip) return;

    function updateSliderUI(value) {
        const min = parseInt(range.min);
        const max = parseInt(range.max);
        const pct = ((value - min) / (max - min)) * 100;

        range.parentElement.style.setProperty('--range-progress', pct + '%');

        const thumbOffset = (20 / 2) * (1 - pct / 100) - (20 / 2) * (pct / 100);
        tooltip.style.left = `calc(${pct}% + ${thumbOffset}px)`;
        tooltip.textContent = value;
    }

    function sync(value) {
        const val = Math.max(parseInt(range.min), Math.min(parseInt(range.max), value || parseInt(range.min)));
        input.value = val;
        range.value = val;
        updateSliderUI(val);
        updatePricing(val);
    }

    range.addEventListener('input', () => sync(parseInt(range.value)));
    input.addEventListener('input', () => sync(parseInt(input.value)));
    input.addEventListener('blur', () => sync(parseInt(input.value)));

    sync(parseInt(range.value));
}

function updatePricing(students) {
    let pricePerStudent = 0;

    document.querySelectorAll('.switch__input:checked').forEach((input) => {
        pricePerStudent += parseFloat(input.dataset.price || 0);
    });

    const totalNetto = students * pricePerStudent;
    const totalBrutto = totalNetto * VAT_RATE;

    const fmt = (val) => val.toLocaleString('pl-PL', { minimumFractionDigits: 2, maximumFractionDigits: 2 }) + ' zł';

    document.getElementById('summaryStudents').textContent = students;
    document.getElementById('summaryPricePerStudent').textContent = fmt(pricePerStudent);
    document.getElementById('summaryNetto').textContent = fmt(totalNetto);
    document.getElementById('summaryBrutto').textContent = fmt(totalBrutto);
}

function initModuleToggles() {
    document.querySelectorAll('.switch__input').forEach((toggle) => {
        toggle.addEventListener('change', () => {
            const students = parseInt(document.getElementById('studentRange').value);
            updatePricing(students);
        });
    });
}

function initModuleNav() {
    const navItems = document.querySelectorAll('.module-nav__item');
    const cards = document.querySelectorAll('.module-card');

    navItems.forEach((item) => {
        item.addEventListener('click', (e) => {
            e.preventDefault();

            const targetId = item.dataset.target;

            navItems.forEach((n) => n.classList.remove('module-nav__item--active'));
            item.classList.add('module-nav__item--active');

            cards.forEach((card) => {
                const isTarget = card.id === targetId;
                card.classList.toggle('module-card--active', isTarget);
                card.classList.toggle('module-card--faded', !isTarget);
                if (isTarget) card.scrollIntoView({ behavior: 'smooth', block: 'center' });
            });
        });
    });
}

function initTrialButton() {
    const btn = document.querySelector('.btn--primary');
    if (!btn) return;

    btn.addEventListener('click', (e) => {
        e.preventDefault();

        document.getElementById('modalStudents').textContent = document.getElementById('summaryStudents').textContent;
        document.getElementById('modalPricePerStudent').textContent = document.getElementById('summaryPricePerStudent').textContent;
        document.getElementById('modalNetto').textContent = document.getElementById('summaryNetto').textContent;
        document.getElementById('modalBrutto').textContent = document.getElementById('summaryBrutto').textContent;

        const list = document.getElementById('modalModulesList');
        list.innerHTML = '';

        document.querySelectorAll('.switch__input:checked').forEach((input) => {
            const label = input.closest('.configurator__toggle-row')?.querySelector('.configurator__toggle-label')?.textContent.trim();
            if (!label) return;

            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between px-0';
            li.innerHTML = `<span>${label}${input.disabled ? ' <small class="text-muted">(obowiązkowe)</small>' : ''}</span><span class="text-muted">${input.dataset.price} zł / słuchacz</span>`;
            list.appendChild(li);
        });

        new Modal(document.getElementById('trialModal')).show();
    });
}

export { pricingPage };
