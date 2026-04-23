import React, { useState, useEffect } from 'react';
import ownerService from '../../services/owner.service';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import SearchInput from '../../components/common/SearchInput';
import Skeleton from '../../components/common/Skeleton';
import ConfirmDialog from '../../components/common/ConfirmDialog';
import Modal from '../../components/common/Modal';
import { Plus, Trash2, Edit2, X } from 'lucide-react';
import toast from 'react-hot-toast';

const Rooms = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hasAccess, setHasAccess] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [submitting, setSubmitting] = useState(false); // UI-016 FIX: loading state for form

    // UI-014 FIX: Use ConfirmDialog instead of window.confirm
    const [deleteTarget, setDeleteTarget] = useState(null);

    const [formData, setFormData] = useState({
        roomNumber: '',
        type: 'Single',
        rent: '',
        capacity: 1,
        amenities: ''
    });

    const fetchRooms = async () => {
        try {
            const res = await ownerService.getRooms();
            if (res.success) {
                setRooms(res.data);
            }
        } catch (error) {
            console.error('Error fetching rooms:', error);
            if (error.response && error.response.status === 403) {
                setHasAccess(false);
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchRooms();
    }, []);

    const handleInputChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const [editingId, setEditingId] = useState(null);

    const handleEdit = (room) => {
        setFormData({
            roomNumber: room.number,
            type: room.type,
            rent: room.price,
            capacity: room.capacity,
            amenities: '' // If amenities were in model, we'd map them
        });
        setEditingId(room._id);
        setIsModalOpen(true);
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setSubmitting(true); // UI-016 FIX
        try {
            if (editingId) {
                const res = await ownerService.updateRoom(editingId, formData);
                if (res.success) {
                    setRooms(rooms.map(r => r._id === editingId ? res.data : r));
                    setIsModalOpen(false);
                    setEditingId(null);
                    setFormData({ roomNumber: '', type: 'Single', rent: '', capacity: 1, amenities: '' });
                    toast.success('Room updated successfully');
                }
            } else {
                const res = await ownerService.createRoom(formData);
                if (res.success) {
                    setRooms([...rooms, res.data]);
                    setIsModalOpen(false);
                    setFormData({ roomNumber: '', type: 'Single', rent: '', capacity: 1, amenities: '' });
                    toast.success('Room created successfully');
                }
            }
        } catch (error) {
            console.error('Error saving room:', error);
            // UI-013 FIX: Use toast instead of alert()
            if (error.response && error.response.status === 403) {
                toast.error("Subscription Required: " + (error.response.data.message || "Please upgrade your plan."));
            } else {
                const msg = error.response?.data?.message || 'Failed to save room';
                toast.error(msg);
            }
        } finally {
            setSubmitting(false); // UI-016 FIX
        }
    };

    const handleDelete = async (id) => {
        try {
            await ownerService.deleteRoom(id);
            setRooms(rooms.filter(room => room._id !== id));
            toast.success('Room deleted successfully');
        } catch (error) {
            console.error('Error deleting room:', error);
            // UI-022 FIX: Always show error feedback
            if (error.response && error.response.status === 403) {
                toast.error("Subscription Required: " + (error.response.data.message || "Please upgrade."));
            } else {
                toast.error(error.response?.data?.message || 'Failed to delete room');
            }
        }
        setDeleteTarget(null);
    };

    if (!hasAccess) {
        return (
            <div className="p-6 flex flex-col items-center justify-center h-full min-h-[400px]">
                <div className="bg-yellow-50 border border-yellow-200 p-8 rounded-2xl text-center max-w-md">
                    <div className="w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <span className="text-3xl">🏠</span>
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800 mb-2">Premium Feature</h2>
                    <p className="text-slate-600 mb-6">
                        Room management is disabled for inactive subscriptions. Upgrade your plan to add or manage rooms.
                    </p>
                    <button
                        onClick={() => window.location.href = '/pricing'}
                        className="bg-primary-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-primary-700 transition-colors"
                    >
                        View Plans
                    </button>
                </div>
            </div>
        );
    }

    // --- Search Filtering Logic ---
    const filteredRooms = rooms.filter(room =>
        room.number.toLowerCase().includes(searchTerm.toLowerCase()) ||
        room.type.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6">
            <div className="flex flex-col md:flex-row justify-between items-center mb-6 gap-4">
                <h1 className="text-2xl font-bold text-slate-900">Room Management</h1>
                <div className="flex gap-2 w-full md:w-auto">
                    <SearchInput
                        value={searchTerm}
                        onChange={setSearchTerm}
                        placeholder="Search Room or Type..."
                    />
                    <Button onClick={() => { setEditingId(null); setFormData({ roomNumber: '', type: 'Single', rent: '', capacity: 1, amenities: '' }); setIsModalOpen(true); }} className="flex items-center gap-2 whitespace-nowrap">
                        <Plus size={20} /> Add Room
                    </Button>
                </div>
            </div>

            {/* UI-010 FIX: Proper skeleton loading state */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm space-y-4">
                            <div className="flex justify-between">
                                <Skeleton className="h-6 w-24" />
                                <Skeleton className="h-6 w-16 rounded-full" />
                            </div>
                            <Skeleton className="h-4 w-32" />
                            <Skeleton className="h-4 w-28" />
                            <div className="flex justify-end gap-2 pt-4 border-t border-slate-100">
                                <Skeleton className="h-8 w-8 rounded-lg" />
                                <Skeleton className="h-8 w-8 rounded-lg" />
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredRooms.length === 0 ? (
                        <p className="text-slate-500 col-span-3 text-center py-8">
                            {searchTerm ? 'No rooms match your search.' : 'No rooms added yet.'}
                        </p>
                    ) : (
                        filteredRooms.map((room) => (
                            <div key={room._id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-200">
                                <div className="flex justify-between items-start mb-4">
                                    <h3 className="text-lg font-bold text-slate-900">Room {room.number}</h3>
                                    <span className="px-3 py-1 bg-primary-100 text-primary-700 text-xs font-semibold rounded-full">
                                        {room.type}
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm text-slate-600 mb-4">
                                    <p>Rent: <span className="font-semibold text-slate-900">₹{room.price}</span>/month</p>
                                    <p>Capacity: {room.capacity} Persons</p>
                                    {/* UI-020 FIX: Show occupancy with progress bar */}
                                    <div>
                                        <div className="flex justify-between items-center mb-1">
                                            <span>Occupied</span>
                                            <span className={`font-semibold ${
                                                (room.occupied || 0) >= room.capacity ? 'text-red-600' :
                                                (room.occupied || 0) >= room.capacity * 0.75 ? 'text-amber-600' :
                                                'text-emerald-600'
                                            }`}>
                                                {room.occupied || 0}/{room.capacity}
                                            </span>
                                        </div>
                                        <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                                            <div
                                                className={`h-full rounded-full transition-all duration-500 ${
                                                    (room.occupied || 0) >= room.capacity ? 'bg-red-500' :
                                                    (room.occupied || 0) >= room.capacity * 0.75 ? 'bg-amber-500' :
                                                    'bg-emerald-500'
                                                }`}
                                                style={{ width: `${Math.min(100, ((room.occupied || 0) / room.capacity) * 100)}%` }}
                                            />
                                        </div>
                                    </div>
                                </div>
                                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
                                    <button onClick={() => handleEdit(room)} className="p-2 text-primary-500 hover:bg-primary-50 rounded-lg transition-colors">
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={() => setDeleteTarget(room)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {/* UI-024 FIX: Accessible Modal with focus trap + ARIA */}
            <Modal
                isOpen={isModalOpen}
                onClose={() => { setIsModalOpen(false); setEditingId(null); setFormData({ roomNumber: '', type: 'Single', rent: '', capacity: 1, amenities: '' }); }}
                title={editingId ? 'Edit Room' : 'Add New Room'}
            >
                <div className="p-6">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">{editingId ? 'Edit Room' : 'Add New Room'}</h2>
                        <button onClick={() => { setIsModalOpen(false); setEditingId(null); setFormData({ roomNumber: '', type: 'Single', rent: '', capacity: 1, amenities: '' }); }}><X size={24} /></button>
                    </div>
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <Input label="Room Number" name="roomNumber" value={formData.roomNumber} onChange={handleInputChange} required />
                        <div>
                            <label className="block text-sm font-medium text-slate-700 mb-1">Type</label>
                            <select
                                name="type"
                                value={formData.type}
                                onChange={handleInputChange}
                                className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-primary-500"
                            >
                                <option value="Single">Single</option>
                                <option value="Double">Double</option>
                                <option value="Triple">Triple</option>
                                <option value="Dorm">Dorm</option>
                            </select>
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <Input label="Rent (₹)" name="rent" type="number" value={formData.rent} onChange={handleInputChange} required />
                            <Input label="Capacity" name="capacity" type="number" value={formData.capacity} onChange={handleInputChange} required />
                        </div>
                        <Button type="submit" className="w-full" isLoading={submitting}>
                            {editingId ? 'Update Room' : 'Create Room'}
                        </Button>
                    </form>
                </div>
            </Modal>

            {/* UI-014 FIX: ConfirmDialog instead of window.confirm */}
            {deleteTarget && (
                <ConfirmDialog
                    title="Delete Room"
                    message={`Are you sure you want to delete Room ${deleteTarget.number}? This action cannot be undone.`}
                    onConfirm={() => handleDelete(deleteTarget._id)}
                    onCancel={() => setDeleteTarget(null)}
                    confirmText="Delete"
                    variant="danger"
                />
            )}
        </div>
    );
};

export default Rooms;
