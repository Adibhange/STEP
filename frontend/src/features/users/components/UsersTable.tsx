"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
	Icon,
	staggerFastContainer,
	fadeSlideUpVariant,
} from "@/design-system";
import { TablePagination } from "@/features/shared";
import { type UserItem } from "../types/user.types";

interface UsersTableProps {
	users: UserItem[];
	isLoading?: boolean;
	onEditUser: (user: UserItem) => void;
}

export const UsersTable: React.FC<UsersTableProps> = ({
	users,
	isLoading,
	onEditUser,
}) => {
	const [currentPage, setCurrentPage] = useState(1);
	const [rowsPerPage, setRowsPerPage] = useState(10);

	// Reset to page 1 whenever search/filter changes the input array
	useEffect(() => {
		setCurrentPage(1);
	}, [users.length]);

	const totalPages = Math.max(1, Math.ceil(users.length / rowsPerPage));
	const paginatedUsers = useMemo(() => {
		const start = (currentPage - 1) * rowsPerPage;
		return users.slice(start, start + rowsPerPage);
	}, [users, currentPage, rowsPerPage]);

	if (isLoading) {
		return (
			<div className='p-8 text-center bg-surface-1 border border-border-default rounded-(--radius-xl) shadow-xs'>
				<Icon
					name='spinner'
					size='lg'
					className='animate-spin text-accent-indigo mx-auto mb-2'
				/>
				<p className='text-xs text-text-tertiary font-medium'>
					Loading user directory...
				</p>
			</div>
		);
	}

	if (users.length === 0) {
		return (
			<div className='p-12 text-center bg-surface-1 border border-border-default rounded-(--radius-xl) shadow-xs'>
				<div className='size-12 rounded-full bg-surface-2 text-text-tertiary flex items-center justify-center mx-auto mb-3 border border-border-default'>
					<Icon
						name='users'
						size='lg'
					/>
				</div>
				<h3 className='text-sm font-bold text-text-primary font-heading'>
					No users found
				</h3>
				<p className='text-xs text-text-tertiary mt-1 max-w-sm mx-auto'>
					No team members match your current filter parameters or search terms.
				</p>
			</div>
		);
	}

	return (
		<div className='bg-surface-1 border border-border-default rounded-(--radius-xl) shadow-xs overflow-hidden'>
			<div className='overflow-x-auto scrollbar-thin'>
				<table className='w-full text-left border-collapse text-xs'>
					<thead>
						<tr className='bg-surface-2 border-b border-border-default text-[11px] font-bold text-text-tertiary uppercase tracking-wider'>
							<th className='py-3 px-4'>Employee</th>
							<th className='py-3 px-4'>Role</th>
							<th className='py-3 px-4'>Department</th>
							<th className='py-3 px-4'>Status</th>
							<th className='py-3 px-4 text-right'>Actions</th>
						</tr>
					</thead>
					<motion.tbody
						className='divide-y divide-border-default text-text-primary font-medium'
						initial='hidden'
						animate='show'
						variants={staggerFastContainer}
						key={`${currentPage}-${rowsPerPage}-${users.length}`}>
						<AnimatePresence mode='popLayout'>
							{paginatedUsers.map((user) => (
								<motion.tr
									key={user.id}
									layout
									variants={fadeSlideUpVariant}
									exit={{ opacity: 0, scale: 0.98 }}
									className='hover:bg-surface-hover transition-colors'>
									<td className='py-3 px-4'>
										<div className='flex items-center gap-3'>
											<div className='size-8 rounded-full bg-linear-to-br from-indigo-500 to-purple-600 text-white font-bold text-xs flex items-center justify-center shrink-0 shadow-xs'>
												{user.name.charAt(0)}
											</div>
											<div>
												<div className='font-bold text-xs text-text-primary'>
													{user.name}
												</div>
												<div className='text-[11px] text-text-tertiary flex items-center gap-1.5 mt-0.5'>
													<span>{user.email}</span>
													<span>•</span>
													<span className='font-mono text-[10.5px] font-semibold text-text-secondary'>
														{user.empId}
													</span>
												</div>
											</div>
										</div>
									</td>
									<td className='py-3 px-4'>
										<span
											className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border ${
												user.role === "Director" ?
													"bg-status-warning-bg text-status-warning-text border-status-warning-border"
												: user.role === "HR" ?
													"bg-accent-indigo-dim text-accent-indigo border-accent-indigo/30"
												:	"bg-accent-cyan-dim text-accent-cyan border-accent-cyan/30"
											}`}>
											<Icon
												name={
													user.role === "Director" ? "shield"
													: user.role === "HR" ?
														"user"
													:	"users"
												}
												size='xs'
											/>
											<span>{user.role}</span>
										</span>
									</td>
									<td className='py-3 px-4 text-text-secondary font-semibold'>
										{user.department}
									</td>
									<td className='py-3 px-4'>
										<span
											className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${
												user.status === "Active" ?
													"bg-status-success-bg text-status-success-text border-status-success-border"
												:	"bg-surface-2 text-text-tertiary border-border-default"
											}`}>
											<span
												className={`size-1.5 rounded-full ${user.status === "Active" ? "bg-status-success" : "bg-text-tertiary"}`}
											/>
											<span>{user.status}</span>
										</span>
									</td>
									<td className='py-3 px-4 text-right'>
										<button
											type='button'
											onClick={() => onEditUser(user)}
											className='p-1.5 text-text-tertiary hover:text-accent-indigo hover:bg-surface-2 rounded-lg transition-colors cursor-pointer'
											title='Edit User Credentials & Access'>
											<Icon
												name='edit'
												size='xs'
											/>
										</button>
									</td>
								</motion.tr>
							))}
						</AnimatePresence>
					</motion.tbody>
				</table>
			</div>

			{/* Table Pagination (Matching Dashboard Candidate Table) */}
			<TablePagination
				currentPage={currentPage}
				totalPages={totalPages}
				totalRecords={users.length}
				rowsPerPage={rowsPerPage}
				onPageChange={setCurrentPage}
				onRowsPerPageChange={(n) => setRowsPerPage(n)}
			/>
		</div>
	);
};
