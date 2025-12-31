'use client'

import { useActionState, useState, useEffect } from "react"
import { updateProfile } from "../auth/actions"
import { User } from "@supabase/supabase-js"
import { Loader2 } from "lucide-react"

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
            <div className="space-y-6">
                <div className="grid md:grid-cols-2 gap-8">
                    <div>
                        <label className="text-sm font-medium text-gray-500">Full Name</label>
                        <p className="text-lg font-medium text-gray-900 border-b border-gray-100 py-2">
                            {initialName || 'Not Set'}
                        </p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">Phone</label>
                        <p className="text-lg font-medium text-gray-900 border-b border-gray-100 py-2">
                            {initialPhone || 'Not Set'}
                        </p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">Email Address</label>
                        <p className="text-lg font-medium text-gray-900 border-b border-gray-100 py-2">
                            {user.email}
                        </p>
                    </div>
                    <div>
                        <label className="text-sm font-medium text-gray-500">User ID</label>
                        <p className="text-sm font-mono text-gray-400 border-b border-gray-100 py-3">
                            {user.id}
                        </p>
                    </div>
                </div>
                <div className="flex justify-end">
                    <button
                        onClick={() => setIsEditing(true)}
                        className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium"
                    >
                        Edit Profile
                    </button>
                </div>
            </div>
        )
    }

    return (
        <form action={formAction} className="space-y-6">
            <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Full Name</label>
                    <input
                        name="fullName"
                        defaultValue={initialName}
                        required
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-300 transition-all"
                    />
                </div>
                <div className="space-y-2">
                    <label className="text-sm font-medium text-gray-700">Phone</label>
                    <input
                        name="phone"
                        defaultValue={initialPhone}
                        className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-lime-300 transition-all"
                    />
                </div>
                <div className="space-y-2 opacity-60">
                    <label className="text-sm font-medium text-gray-700">Email Address</label>
                    <input
                        disabled
                        value={user.email}
                        className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl cursor-not-allowed text-gray-500"
                    />
                </div>
                <div className="space-y-2 opacity-60">
                    <label className="text-sm font-medium text-gray-700">User ID</label>
                    <input
                        disabled
                        value={user.id}
                        className="w-full p-3 bg-gray-100 border border-gray-200 rounded-xl cursor-not-allowed font-mono text-xs text-gray-500"
                    />
                </div>
            </div>

            {state?.error && (
                <div className="text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                    {state.error}
                </div>
            )}

            <div className="flex justify-end gap-3">
                <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="px-6 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors text-sm font-medium"
                >
                    Cancel
                </button>
                <button
                    type="submit"
                    disabled={isPending}
                    className="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 transition-colors text-sm font-medium flex items-center gap-2"
                >
                    {isPending && <Loader2 className="w-4 h-4 animate-spin" />}
                    Save Changes
                </button>
            </div>
        </form>
    )
}
