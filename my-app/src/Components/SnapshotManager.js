import { useNavigate } from "react-router-dom";
import "./SnapshotManager.css";
import axios from "axios";
import { useState } from "react";

const SnapshotManager = ({ user }) => {
	console.log("user at", user);
	const navigate = useNavigate();
	const [isActive, setIsActive] = useState(true);

	const handleDailySnapshot = () => {
		setIsActive(false);
		try {
			axios
				.get("/snapshot/take_daily_snapshot")
				.then((res) => {
					console.log(res);
					alert("Snapshot created");
				})
				.catch((err) => {
					console.log(err);
					alert("Snapshot might exist or DR entries are insufficient");
				});
		} catch (error) {
			console.log(error);
		} finally {
			setIsActive(true);
		}
	};

	const handleDailySnapshotForced = () => {
		setIsActive(false);
		try {
			axios
				.get("/snapshot/take_daily_snapshot_force")
				.then((res) => {
					console.log(res);
					alert("Forced Snapshot created");
				})
				.catch((err) => {
					console.log(err);
					alert("Error occured/ DR entries may be are insufficient");
				});
		} catch (error) {
			console.log(error);
		} finally {
			setIsActive(true);
		}
	};

	const handleMonthlySnapshot = () => {
		setIsActive(false);
		try {
			axios
				.get("/snapshot/take_monthly_snapshot")
				.then((res) => {
					console.log(res);
					alert("Snapshot created");
				})
				.catch((err) => {
					console.log(err);
					alert("Snapshot might exist or DR entries are insufficient");
				});
		} catch (error) {
			console.log(error);
		} finally {
			setIsActive(true);
		}
	};

	const handleMonthlySnapshotForced = () => {
		setIsActive(false);
		try {
			axios
				.get("/snapshot/take_monthly_snapshot_force")
				.then((res) => {
					console.log(res);
					alert("Forced Snapshot created");
				})
				.catch((err) => {
					console.log(err);
					alert("Error occured. DR entries may be are insufficient");
				});
		} catch (error) {
			console.log(error);
		} finally {
			setIsActive(true);
		}
	};

	if (!user) {
		return (
			<div>
				<h1 className='text-center text-2xl mt-10'></h1>
				<button
					onClick={() => navigate("/login")}
					className='p-3 bg-green-500 text-white rounded-lg btn-container'>
					Please Login
				</button>
			</div>
		);
	}

	return (
		<div className='flex flex-col items-center justify-center h-screen bg-gray-100 padding'>
			<h1 className='text-3xl font-bold mb-6'>Snapshot Manager</h1>

			{user.userType === "Admin" ? (
				<div className='btns-container'>
					<button
						onClick={handleDailySnapshot}
						disabled={!isActive}
						className='p-3 bg-green-500 text-white rounded-lg btn-container'>
						Take Daily Snapshot
					</button>
					<button
						onClick={handleDailySnapshotForced}
						disabled={!isActive}
						className='p-3 bg-green-500 text-white rounded-lg btn-container'>
						Take Forced Daily Snapshot 💪🏻
					</button>
					<button
						onClick={handleMonthlySnapshot}
						disabled={!isActive}
						className='p-3 bg-green-500 text-white rounded-lg btn-container'>
						Take Monthly Snapshot
					</button>
					<button
						onClick={handleMonthlySnapshotForced}
						disabled={!isActive}
						className='p-3 bg-green-500 text-white rounded-lg btn-container'>
						Take Forced Monthly Snapshot 💪🏻
					</button>
				</div>
			) : (
				<b>This page is only for Admin</b>
			)}
		</div>
	);
};

export default SnapshotManager;
