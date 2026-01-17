'use client'

import { useActionState, useState, useEffect } from "react"
import { updateProfile } from "../auth/actions"
import { User } from "@supabase/supabase-js"
import { Loader2, User as UserIcon, Phone, Mail, Hash, Pencil } from "lucide-react"

interface EditProfileFormProps {
    user: User
    profile: any
}

export function EditProfileForm({ user, profile }: EditProfileFormProps) {
    const [isEditing, setIsEditing] = useState(false)
    const [state, formAction, isPending] = useActionState(updateProfile, null)

    // Close form when update is successful
    useEffect(() => {
        if (state?.success) {
            setIsEditing(false)
        }
    }, [state])

    const initialName = profile?.full_name || user.user_metadata.full_name || ''
    const initialPhone = profile?.phone || user.user_metadata.phone || ''

    if (!isEditing) {
        return (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="flex justify-between items-center mb-6">
                    <h2 className="text-xl font-bold text-gray-900">Personal Details</h2>
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-5 py-2.5 bg-gray-900 text-white rounded-xl hover:bg-black transition-all text-sm font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 group"
                    >
                        <Pencil className="w-4 h-4 group-hover:scale-110 transition-transform" /> Edit Profile
                    </button>
                </div>

                <div className="grid md:grid-cols-2 gap-x-12 gap-y-8">
                    <div className="group">
                        <label className="text-sm font-semibold text-gray-500 flex items-center gap-2 mb-3">
                            <span className="p-1.5 bg-lime-100 rounded-lg text-lime-700 group-hover:bg-lime-200 transition-colors">
                                <UserIcon className="w-4 h-4" />
                            </span>
                            Full Name
                        </label>
                        <p className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-3 pl-1">
                            {initialName || <span className="text-gray-400 italic">Not Set</span>}
                        </p>
                    </div>
                    <div className="group">
                        <label className="text-sm font-semibold text-gray-500 flex items-center gap-2 mb-3">
                            <span className="p-1.5 bg-lime-100 rounded-lg text-lime-700 group-hover:bg-lime-200 transition-colors">
                                <Phone className="w-4 h-4" />
                            </span>
                            Phone Number
                        </label>
                        <p className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-3 pl-1 font-mono">
                            {initialPhone || <span className="text-gray-400 italic">Not Set</span>}
                        </p>
                    </div>
                    <div className="group">
                        <label className="text-sm font-semibold text-gray-500 flex items-center gap-2 mb-3">
                            <span className="p-1.5 bg-gray-100 rounded-lg text-gray-600 group-hover:bg-gray-200 transition-colors">
                                <Mail className="w-4 h-4" />
                            </span>
                            Email Address
                        </label>
                        <p className="text-lg font-medium text-gray-900 border-b border-gray-100 pb-3 pl-1">
                            {user.email}
                        </p>
                    </div>
                    <div className="group">
                        <label className="text-sm font-semibold text-gray-500 flex items-center gap-2 mb-3">
                            <span className="p-1.5 bg-gray-100 rounded-lg text-gray-600 group-hover:bg-gray-200 transition-colors">
                                <Hash className="w-4 h-4" />
                            </span>
                            User ID
                        </label>
                        <p className="text-sm font-mono text-gray-400 border-b border-gray-100 pb-4 pl-1 truncate">
                            {user.id}
                        </p>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <form action={formAction} className="space-y-8 animate-in fade-in zoom-in-95 duration-300">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-900">Edit Details</h2>
            </div>

            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700">Full Name</label>
                    <input
                        name="fullName"
                        defaultValue={initialName}
                        required
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400 transition-all placeholder:text-gray-400"
                        placeholder="Enter your full name"
                    />
                </div>
                <div className="space-y-3">
                    <label className="text-sm font-bold text-gray-700">Phone</label>
                    <input
                        name="phone"
                        defaultValue={initialPhone}
                        className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-lime-400/50 focus:border-lime-400 transition-all placeholder:text-gray-400"
                        placeholder="+234..."
                    />
                </div>
                <div className="space-y-3 opacity-60 pointer-events-none">
                    <label className="text-sm font-bold text-gray-700">Email Address</label>
                    <input
                        disabled
                        value={user.email}
                        className="w-full p-4 bg-gray-100 border border-gray-200 rounded-2xl text-gray-500 cursor-not-allowed"
                    />
                </div>
                <div className="space-y-3 opacity-60 pointer-events-none">
                    <label className="text-sm font-bold text-gray-700">User ID</label>
                    <input
                        disabled
                        value={user.id}
                        className="w-full p-4 bg-gray-100 border border-gray-200 rounded-2xl font-mono text-xs text-gray-500 cursor-not-allowed"
                    />
                </div>
            </div>

            {state?.error && (
                <div className="text-red-600 text-sm bg-red-50 p-4 rounded-xl border border-red-100 flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-red-600 shrink-0" />
                    {state.error}
                </div>
            )}

            <div className="flex justify-end gap-3 pt-4">
                <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-3 bg-white text-gray-700 rounded-xl hover:bg-gray-50 transition-colors text-sm font-semibold border border-gray-200"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isPending}
                    className="px-8 py-3 bg-gray-900 text-white rounded-xl hover:bg-black transition-all text-sm font-semibold shadow-lg hover:shadow-xl hover:-translate-y-0.5 active:translate-y-0 flex items-center gap-2 disabled:opacity-70 disabled:transform-none"
                >
                    {isPending ? (
                        <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            Saving...
                        </>
                    ) : (
                        "Save Changes"
                    )}
                </button>
            </div>
        </form>
    )
}
