import React, { useState, useEffect } from 'react';
import ownerService from '../../services/owner.service';
import Button from '../../components/common/Button';
import Input from '../../components/common/Input';
import SearchInput from '../../components/common/SearchInput';
import { Plus, Trash2, Edit2, X } from 'lucide-react';

const Rooms = () => {
    const [rooms, setRooms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [hasAccess, setHasAccess] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');

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
        try {
            if (editingId) {
                const res = await ownerService.updateRoom(editingId, formData);
                if (res.success) {
                    setRooms(rooms.map(r => r._id === editingId ? res.data : r));
                    setIsModalOpen(false);
                    setEditingId(null);
                    setFormData({ roomNumber: '', type: 'Single', rent: '', capacity: 1, amenities: '' });
                }
            } else {
                const res = await ownerService.createRoom(formData);
                if (res.success) {
                    setRooms([...rooms, res.data]);
                    setIsModalOpen(false);
                    setFormData({ roomNumber: '', type: 'Single', rent: '', capacity: 1, amenities: '' });
                }
            }
        } catch (error) {
            console.error('Error saving room:', error);
            if (error.response && error.response.status === 403) {
                alert("Subscription Required: " + (error.response.data.message || "Please upgrade."));
            } else {
                const msg = error.response?.data?.message || 'Failed to save room';
                alert(msg);
            }
        }
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this room?')) {
            try {
                await ownerService.deleteRoom(id);
                setRooms(rooms.filter(room => room._id !== id));
            } catch (error) {
                console.error('Error deleting room:', error);
                if (error.response && error.response.status === 403) {
                    alert("Subscription Required: " + (error.response.data.message || "Please upgrade."));
                }
            }
        }
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
                        className="bg-indigo-600 text-white px-6 py-2 rounded-lg font-semibold hover:bg-indigo-700 transition-colors"
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

            {loading ? (
                <p>Loading rooms...</p>
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
                                    <span className="px-3 py-1 bg-indigo-100 text-indigo-700 text-xs font-semibold rounded-full">
                                        {room.type}
                                    </span>
                                </div>
                                <div className="space-y-2 text-sm text-slate-600 mb-4">
                                    <p>Rent: <span className="font-semibold text-slate-900">₹{room.price}</span>/month</p>
                                    <p>Capacity: {room.capacity} Persons</p>
                                </div>
                                <div className="flex justify-end gap-2 mt-4 pt-4 border-t border-slate-100">
                                    <button onClick={() => handleEdit(room)} className="p-2 text-indigo-500 hover:bg-indigo-50 rounded-lg transition-colors">
                                        <Edit2 size={18} />
                                    </button>
                                    <button onClick={() => handleDelete(room._id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors">
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
                    <div className="bg-white p-6 rounded-xl w-full max-w-md">
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
                                    className="w-full px-3 py-2 border border-slate-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                >
                                    <option value="Single">Single</option>
                                    <option value="Double">Double</option>
                                    <option value="Triple">Triple</option>
                                </select>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <Input label="Rent (₹)" name="rent" type="number" value={formData.rent} onChange={handleInputChange} required />
                                <Input label="Capacity" name="capacity" type="number" value={formData.capacity} onChange={handleInputChange} required />
                            </div>
                            <Button type="submit" className="w-full">Create Room</Button>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default Rooms;
