import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { vi } from 'vitest';
import Rooms from './Rooms';
import ownerService from '../../services/owner.service';

// Mock ownerService
vi.mock('../../services/owner.service');

describe('Owner Rooms Component', () => {
    beforeEach(() => {
        vi.clearAllMocks();
    });

    const mockRooms = [
        { _id: '1', number: '101', type: 'Single', price: 5000, capacity: 1 },
        { _id: '2', number: '102', type: 'Double', price: 8000, capacity: 2 }
    ];

    it('renders room list correctly', async () => {
        ownerService.getRooms.mockResolvedValue({ success: true, data: mockRooms });

        render(<Rooms />);

        await waitFor(() => {
            expect(screen.getByText('Room 101')).toBeInTheDocument();
            expect(screen.getByText('Room 102')).toBeInTheDocument();
            expect(screen.getByText('₹5000')).toBeInTheDocument();
        });
    });

    it('notifies on fetch error', async () => {
        ownerService.getRooms.mockRejectedValue(new Error('Failed'));
        const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => { });

        render(<Rooms />);

        await waitFor(() => {
            expect(consoleSpy).toHaveBeenCalledWith('Error fetching rooms:', expect.any(Error));
        });
    });

    it('opens add room modal and submits form', async () => {
        ownerService.getRooms.mockResolvedValue({ success: true, data: [] });
        ownerService.createRoom.mockResolvedValue({ success: true, data: mockRooms[0] });

        render(<Rooms />);

        // Open Modal
        fireEvent.click(screen.getByText('Add Room'));
        expect(screen.getByText('Add New Room')).toBeInTheDocument();

        // Fill Form
        fireEvent.change(screen.getByLabelText(/Room Number/i), { target: { value: '101' } });
        fireEvent.change(screen.getByLabelText(/Rent/i), { target: { value: '5000' } });
        fireEvent.change(screen.getByLabelText(/Capacity/i), { target: { value: '1' } });

        // Submit
        fireEvent.click(screen.getByText('Create Room'));

        await waitFor(() => {
            expect(ownerService.createRoom).toHaveBeenCalled();
            expect(screen.queryByText('Add New Room')).not.toBeInTheDocument(); // Modal closed
            expect(screen.getByText('Room 101')).toBeInTheDocument(); // Room added to list
        });
    });

    it('handles delete room', async () => {
        ownerService.getRooms.mockResolvedValue({ success: true, data: mockRooms });
        ownerService.deleteRoom.mockResolvedValue({ success: true });

        // Mock window.confirm
        const confirmSpy = vi.spyOn(window, 'confirm').mockImplementation(() => true);

        render(<Rooms />);

        await waitFor(() => screen.getByText('Room 101'));

        // Click delete on first room
        const deleteButtons = screen.getAllByRole('button');
        // Filter for the trash icon button usually, but here we can rely on order or class
        // Simpler: just find the button in the first room card. 
        // Our component uses a trash icon button.
        // Let's assume the last button is delete or use a specific query if possible.
        // Or simpler, add aria-label to component and query by that. 
        // For now, let's grab the button containing the Trash icon or similar.
        // Actually, since we didn't add aria-labels, let's just assume the delete action works if we click the button inside the card.

        // Let's refine the component to be testable or rely on the fact that delete buttons are distinct.
        // The delete button is created as: <button onClick={() => handleDelete(room._id)} ...><Trash2 .../></button>
        // We can get by class 'text-red-500'.

        // Wait, 'getAllByRole' button might include 'Add Room'.
        // Let's use logic:
        const deleteBtns = document.querySelectorAll('.text-red-500'); // Class used in component
        if (deleteBtns.length > 0) {
            fireEvent.click(deleteBtns[0]);
        }

        await waitFor(() => {
            expect(confirmSpy).toHaveBeenCalled();
            expect(ownerService.deleteRoom).toHaveBeenCalledWith('1');
            expect(screen.queryByText('Room 101')).not.toBeInTheDocument();
        });
    });
});
