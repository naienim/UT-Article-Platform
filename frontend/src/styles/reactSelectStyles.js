function getCssVar(name, fallback) {
    const v = getComputedStyle(document.documentElement).getPropertyValue(name).trim()
    return v || fallback
}

export function createSelectStyles() {
    const border = getCssVar('--border', '#e2e8f0')
    const text = getCssVar('--text', '#0f172a')
    const muted = getCssVar('--muted', '#475569')
    const placeholder = getCssVar('--placeholder', '#94a3b8')
    const surface = getCssVar('--surface', '#ffffff')
    const surface2 = getCssVar('--surface-2', '#f1f5f9')
    const primary = getCssVar('--primary', '#2563eb')

    return {
        container: (base) => ({ ...base }),
        control: (base, state) => ({
            ...base,
            minHeight: 42,
            borderRadius: 12,
            backgroundColor: surface,
            borderColor: state.isFocused ? primary : border,
            boxShadow: state.isFocused ? 'var(--focus-ring)' : 'none',
            transition: 'border-color 150ms ease, box-shadow 150ms ease',
            ':hover': { borderColor: state.isFocused ? primary : border }
        }),

        valueContainer: (base) => ({ ...base, padding: '2px 10px' }),
        input: (base) => ({ ...base, color: text }),
        placeholder: (base) => ({ ...base, color: placeholder }),
        singleValue: (base) => ({ ...base, color: text }),
        multiValue: (base) => ({ ...base, backgroundColor: surface2, borderRadius: 999, border: `1px solid ${border}` }),
        multiValueLabel: (base) => ({ ...base, color: text, padding: '3px 8px', fontSize: 13 }),
        multiValueRemove: (base) => ({ ...base, borderRadius: 999, color: muted, ':hover': { backgroundColor: 'rgba(220, 38, 38, 0.10)', color: '#dc2626' } }),
        indicatorsContainer: (base) => ({ ...base, paddingRight: 6 }),
        dropdownIndicator: (base, state) => ({ ...base, color: state.isFocused ? text : muted, ':hover': { color: text } }),
        clearIndicator: (base) => ({ ...base, color: muted, ':hover': { color: text } }),
        indicatorSeparator: (base) => ({ ...base, backgroundColor: border }),
        menu: (base) => ({ ...base, borderRadius: 12, backgroundColor: surface, border: `1px solid ${border}`, boxShadow: 'var(--shadow-md)', overflow: 'hidden' }),
        menuList: (base) => ({ ...base, padding: 6 }),
        noOptionsMessage: (base) => ({ ...base, color: muted }),
        option: (base, state) => ({
            ...base,
            borderRadius: 10,
            padding: '10px 10px',
            cursor: 'pointer',
            backgroundColor: state.isSelected ? 'rgba(37, 99, 235, 0.12)' : state.isFocused ? surface2 : 'transparent',
            color: text,
            ':active': { backgroundColor: 'rgba(37, 99, 235, 0.18)' }
        })
    }
}
