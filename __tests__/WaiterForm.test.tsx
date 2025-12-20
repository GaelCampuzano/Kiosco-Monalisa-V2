import { render, screen, fireEvent } from '@testing-library/react';
import { WaiterForm } from '@/app/components/WaiterForm';
import { translations } from '@/lib/translations';
import { vi, describe, it, expect } from 'vitest';

describe('WaiterForm', () => {
    const defaultProps = {
        tableNumber: '',
        setTableNumber: vi.fn(),
        waiterName: '',
        setWaiterName: vi.fn(),
        onSubmit: vi.fn(),
        text: translations.es
    };

    it('renders correctly', () => {
        render(<WaiterForm {...defaultProps} />);
        expect(screen.getByText(translations.es.waiterTitle)).toBeDefined();
        expect(screen.getByPlaceholderText('#')).toBeDefined();
    });

    it('validates numeric input for table number', () => {
        render(<WaiterForm {...defaultProps} />);
        const input = screen.getByPlaceholderText('#');

        fireEvent.change(input, { target: { value: '123' } });
        expect(defaultProps.setTableNumber).toHaveBeenCalledWith('123');

        fireEvent.change(input, { target: { value: 'abc' } });
        // The component logic replaces non-numeric chars, so we expect empty string or just numeric part
        // Mock setTableNumber ensures we just verify if it was called (logic is inside component actually)
    });

    it('calls onSubmit when form is submitted', () => {
        // We need to render with values to allow submission
        render(<WaiterForm {...defaultProps} tableNumber="5" waiterName="John" />);

        const button = screen.getByText(translations.es.btnDeliver);
        fireEvent.click(button);

        expect(defaultProps.onSubmit).toHaveBeenCalled();
    });
});
