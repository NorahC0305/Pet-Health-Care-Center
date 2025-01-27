import React, { useEffect, useState } from "react";
import { Box, Typography, useTheme } from "@mui/material";
import { tokens } from "../../../../theme";
import { mockTransactions, mockDataTeam } from "../../../data/mockData";
import PointOfSaleIcon from "@mui/icons-material/PointOfSale";
import TrafficIcon from "@mui/icons-material/Traffic";
import Header from "../../../../Components/dashboardChart/Header";
import LineChart from "../../../../Components/dashboardChart/LineChart";
import BarChart from "../../../../Components/dashboardChart/BarChart";
import StatBox from "../../../../Components/dashboardChart/StatBox";
import PieChart from "../../../../Components/dashboardChart/PieChart";
const Dashboard = () => {
  const theme = useTheme();
  const colors = tokens(theme.palette.mode);

  const getCurrentDate = () => {
    const currentDate = new Date();
    const year = currentDate.getFullYear();
    const month = String(currentDate.getMonth() + 1).padStart(2, "0");
    const day = String(currentDate.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  const [dailyRevenue, setDailyRevenue] = useState(0);
  const [weeklyRevenue, setWeeklyRevenue] = useState(0);
  const [monthlyRevenue, setMonthlyRevenue] = useState(0);
  const [yearlyRevenue, setYearlyRevenue] = useState(0);
  const [dailyRevenueChange, setDailyRevenueChange] = useState("0%");
  const [monthlyRevenueChange, setMonthlyRevenueChange] = useState("0%");
  const [yearlyRevenueChange, setYearlyRevenueChange] = useState("0%");
  const [selectedDate, setSelectedDate] = useState(getCurrentDate());
  const [isCustomDateSelected, setIsCustomDateSelected] = useState(false);
  const [newUser, setNewUser] = useState("");

  // const getStartOfWeek = (date) => {
  //   const currentDate = new Date(date);
  //   const day = currentDate.getDay();
  //   const diff = currentDate.getDate() - day + (day === 0 ? -6 : 1); // adjust when day is sunday
  //   return new Date(currentDate.setDate(diff));
  // };
  // console.log(selectedDate);
  // console.log(getStartOfWeek("2024-07-12"));
  // const getWeekStartEndDate = () => {
  //   const currentDate = new Date();
  //   const firstDay = currentDate.getDate() - currentDate.getDay() + 1; // Monday
  //   const startDate = new Date(currentDate.setDate(firstDay));
  //   const lastDay = currentDate.getDate() - currentDate.getDay() + 7; // Sunday
  //   const endDate = new Date(currentDate.setDate(lastDay));
  //   return "Start day: "+formatDate(startDate) +" End day: "+ formatDate(endDate);
  // };
  // console.log(getWeekStartEndDate());

  const formatDate = (date) => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };
  const getWeekDates = () => {
    const currentDate = new Date();
    const firstDay = currentDate.getDate() - currentDate.getDay() + 1; // Monday
    const startDate = new Date(currentDate.setDate(firstDay));
    const weekDates = [];

    for (let i = 0; i < 7; i++) {
      const date = new Date(startDate);
      date.setDate(startDate.getDate() + i);
      weekDates.push(formatDate(date));
    }

    return weekDates;
  };

  const getTotalPaid = (date, type) => {
    let totalPaid = 0;
    let currentYear = new Date().getFullYear();

    mockDataTeam.forEach((user) => {
      for (const bookingId in user.bookings) {
        const booking = user.bookings[bookingId];

        if (
          !["Paid", "Checked-in", "Rated", "Cancelled"].includes(booking.status)
        )
          continue;

        let inputStr = booking.bookingId;
        let strippedStr = inputStr.slice(2);
        let day = strippedStr.slice(0, 2);
        let month = strippedStr.slice(2, 4);
        let formattedDate = `${currentYear}-${month}-${day}`;

        let bookingTotalPaid = booking.totalPaid || 0;

        if (booking.status === "Cancelled") {
          bookingTotalPaid *= 0.25;
        }

        if (type === "date" && date === formattedDate) {
          totalPaid += bookingTotalPaid;
        } else if (type === "month" && formattedDate.startsWith(date)) {
          totalPaid += bookingTotalPaid;
        } else if (type === "year" && formattedDate.startsWith(date)) {
          totalPaid += bookingTotalPaid;
        } else if (type === "week" && date.includes(formattedDate)) {
          totalPaid += bookingTotalPaid;
        }
      }
    });

    return totalPaid;
  };

  const getPreviousDay = () => {
    const currentDate = new Date();
    const previousDay = new Date(
      currentDate.setDate(currentDate.getDate() - 1)
    );
    const year = previousDay.getFullYear();
    const month = String(previousDay.getMonth() + 1).padStart(2, "0");
    const day = String(previousDay.getDate()).padStart(2, "0");
    return { year, month, day, previousDay: `${year}-${month}-${day}` };
  };

  const getPreviousMonth = () => {
    const currentDate = new Date();
    const previousMonth = new Date(
      currentDate.setMonth(currentDate.getMonth() - 1)
    );
    const year = previousMonth.getFullYear();
    const month = String(previousMonth.getMonth() + 1).padStart(2, "0");
    return { year, month };
  };

  const getPreviousYear = () => {
    const currentDate = new Date();
    const previousYear = new Date(
      currentDate.setFullYear(currentDate.getFullYear() - 1)
    );
    const year = previousYear.getFullYear();
    return year;
  };

  useEffect(() => {
    const updateRevenue = () => {
      const currentDate = getCurrentDate();
      // console.log(isCustomDateSelected);
      if (isCustomDateSelected && selectedDate !== currentDate) {
        const totalPaidForSelectedDate = getTotalPaid(selectedDate, "date");
        setDailyRevenue(totalPaidForSelectedDate);
        return;
      }

      const previousDay = getPreviousDay();
      const previousMonth = getPreviousMonth();
      const previousYear = getPreviousYear();

      // Daily Revenue
      const totalPaidForDate = getTotalPaid(currentDate, "date");
      const totalPaidForPreviousDay = getTotalPaid(
        previousDay.previousDay,
        "date"
      );
      setDailyRevenue(totalPaidForDate);

      const dailyPercentageChange =
        totalPaidForPreviousDay === 0
          ? "N/A"
          : ((totalPaidForDate - totalPaidForPreviousDay) /
              totalPaidForPreviousDay) *
            100;
      setDailyRevenueChange(
        totalPaidForPreviousDay === 0
          ? "N/A"
          : `${dailyPercentageChange.toFixed(2)}%`
      );

      // Weekly Revenue
      const weekDates = getWeekDates();
      // console.log(weekDates);
      const weeklyTotal = getTotalPaid(weekDates, "week");
      // console.log(weeklyTotal);
      setWeeklyRevenue(weeklyTotal);

      // Monthly Revenue
      const totalPaidForMonth = getTotalPaid(
        `${currentDate.split("-")[0]}-${currentDate.split("-")[1]}`,
        "month"
      );
      const totalPaidForPreviousMonth = getTotalPaid(
        `${previousMonth.year}-${previousMonth.month}`,
        "month"
      );
      setMonthlyRevenue(totalPaidForMonth);

      const monthlyPercentageChange =
        totalPaidForPreviousMonth === 0
          ? "N/A"
          : ((totalPaidForMonth - totalPaidForPreviousMonth) /
              totalPaidForPreviousMonth) *
            100;
      setMonthlyRevenueChange(
        totalPaidForPreviousMonth === 0
          ? "N/A"
          : `${monthlyPercentageChange.toFixed(2)}%`
      );

      // Yearly Revenue
      const totalPaidForYear = getTotalPaid(currentDate.split("-")[0], "year");
      const totalPaidForPreviousYear = getTotalPaid(previousYear, "year");
      setYearlyRevenue(totalPaidForYear);

      const yearlyPercentageChange =
        totalPaidForPreviousYear === 0
          ? "N/A"
          : ((totalPaidForYear - totalPaidForPreviousYear) /
              totalPaidForPreviousYear) *
            100;
      setYearlyRevenueChange(
        totalPaidForPreviousYear === 0
          ? "N/A"
          : `${yearlyPercentageChange.toFixed(2)}%`
      );
    };

    updateRevenue();

    const intervalId = setInterval(updateRevenue, 1000);

    return () => clearInterval(intervalId);
  }, [isCustomDateSelected, selectedDate]);

  useEffect(() => {
    if (selectedDate) {
      if (selectedDate === getCurrentDate()) {
        setIsCustomDateSelected(false);
      } else {
        setIsCustomDateSelected(true);
      }
    } else {
      setIsCustomDateSelected(false);
    }
  }, [selectedDate]);

  const handleDateChange = (event) => {
    setSelectedDate(event.target.value);
  };

  useEffect(() => {
    let newUserCount = 0;
    mockDataTeam.forEach((user) => {
      if (user.creationTime) {
        const date = new Date(user.creationTime);
        const day = date.getDate();
        const month = date.getMonth();
        const year = date.getFullYear();
        let fullDate = `${year}-${month}-${day}`;
        // console.log(fullDate);
        // console.log(getCurrentDate());
        if (fullDate > getCurrentDate()) {
          // console.log("new user");
          setNewUser((newUserCount += 1));
        }
      }
    });
  });
  // console.log(dailyRevenue);
  return (
    <Box m="20px">
      {/* HEADER */}
      <Box display="flex" justifyContent="space-between" alignItems="center">
        <Header title="DASHBOARD" subtitle="Welcome to your dashboard" />
      </Box>
      <div className="date-filter-container">
        <h1>Filter by day:</h1>
        <input
          className="date-Filter-Revenue"
          type="date"
          onChange={handleDateChange}
          value={selectedDate}
        ></input>
      </div>
      {/* GRID & CHARTS */}
      <Box
        display="grid"
        gridTemplateColumns="repeat(12, 1fr)"
        gridAutoRows="140px"
        gap="20px"
      >
        {/* ROW 1 */}
        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={`${(dailyRevenue * 1000).toLocaleString("en-US", {
              maximumFractionDigits: 0,
            })} VND`}
            subtitle="Daily Revenue"
            icon={
              <PointOfSaleIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>

        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={`${(weeklyRevenue * 1000).toLocaleString("en-US", {
              maximumFractionDigits: 0,
            })} VND`}
            subtitle="Weekly Revenue"
            progress="0.30"
            increase={yearlyRevenueChange}
            icon={
              <PointOfSaleIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>

        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={`${(monthlyRevenue * 1000).toLocaleString("en-US", {
              maximumFractionDigits: 0,
            })} VND`}
            subtitle="Monthly Revenue"
            progress="0.50"
            increase={monthlyRevenueChange}
            icon={
              <PointOfSaleIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>

        <Box
          gridColumn="span 3"
          backgroundColor={colors.primary[400]}
          display="flex"
          alignItems="center"
          justifyContent="center"
        >
          <StatBox
            title={newUser}
            subtitle="New User this month"
            progress="0.80"
            increase="+43%"
            icon={
              <TrafficIcon
                sx={{ color: colors.greenAccent[600], fontSize: "26px" }}
              />
            }
          />
        </Box>

        {/* ROW 2 */}
        <Box
          gridColumn="span 8"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Box
            mt="25px"
            p="0 30px"
            display="flex "
            justifyContent="space-between"
            alignItems="center"
          >
            <Box>
              <Typography
                variant="h5"
                fontWeight="600"
                color={colors.grey[100]}
              >
                Yearly Revenue Generated
              </Typography>
              <Typography
                variant="h3"
                fontWeight="bold"
                color={colors.greenAccent[500]}
              >
                {`${(yearlyRevenue * 1000).toLocaleString("en-US", {
                  maximumFractionDigits: 0,
                })} VND`}
              </Typography>
            </Box>
          </Box>
          <Box height="250px" m="-20px 0 0 0">
            <LineChart isDashboard={true} />
          </Box>
        </Box>
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ padding: "30px 30px 0 30px" }}
          >
            Sales Quantity
          </Typography>
          <Box height="250px" mt="-20px">
            <PieChart isDashboard={true} />
          </Box>
        </Box>

        {/* ROW 3 */}
        <Box
          gridColumn="span 4"
          gridRow="span 2"
          backgroundColor={colors.primary[400]}
        >
          <Typography
            variant="h5"
            fontWeight="600"
            sx={{ padding: "30px 30px 0 30px" }}
          >
            Sales Quantity By Month
          </Typography>
          <Box height="250px" mt="-20px">
            <BarChart isDashboard={true} />
          </Box>
        </Box>
        <Box
          gridColumn="span 8"
          gridRow="span 2 "
          backgroundColor={colors.primary[400]}
          overflow="auto"
        >
          <Box
            display="flex"
            justifyContent="space-between"
            alignItems="center"
            borderBottom={`4px solid ${colors.primary[500]}`}
            colors={colors.grey[100]}
            p="15px"
            position="sticky"
            top="0"
            backgroundColor={colors.primary[400]}
          >
            <Typography color={colors.grey[100]} variant="h5" fontWeight="600">
              Recent Transactions
            </Typography>
          </Box>
          {mockTransactions
            .filter((transaction) => transaction.status !== "Cancelled")
            .map((transaction, i) => (
              <Box
                key={`${transaction.bookingId}-${i}`}
                display="flex"
                justifyContent="space-between"
                alignItems="center"
                borderBottom={`4px solid ${colors.primary[500]}`}
                p="15px"
              >
                <Box flex="1">
                  <Typography
                    color={colors.greenAccent[500]}
                    variant="h5"
                    fontWeight="600"
                    fontSize={"2rem"}
                  >
                    {transaction.bookingID}
                  </Typography>
                  <Typography color={colors.grey[100]} fontSize={"2rem"}>
                    {transaction.user}
                  </Typography>
                </Box>
                <Box flex="1" textAlign="center">
                  <Typography color={colors.grey[100]} fontSize={"2rem"}>
                    {transaction.time + " " + transaction.date}
                  </Typography>
                </Box>
                <Box flex="1" textAlign="center">
                  <Typography
                    color={
                      transaction.status === "Checked-in"
                        ? colors.blueAccent[500]
                        : transaction.status === "Rated"
                        ? "yellow"
                        : transaction.status === "Pending Payment"
                        ? "rgb(255, 219, 194)"
                        : colors.greenAccent[500]
                    }
                    fontSize={"2rem"}
                  >
                    {transaction.status}
                  </Typography>
                </Box>
                <Box
                  flex=".5"
                  textAlign="center"
                  backgroundColor={colors.greenAccent[500]}
                  p="5px 5px"
                  borderRadius="4px"
                  fontSize={"2rem"}
                >
                  {`${(transaction.cost * 1000).toLocaleString("en-US", {
                    maximumFractionDigits: 0,
                  })} VND`}
                </Box>
              </Box>
            ))}
        </Box>
        {/* <Box
            gridColumn="span 4"
            gridRow="span 2"
            backgroundColor={colors.primary[400]}
            padding="30px"
          >
            {weeklyRevenue}
          </Box> */}
      </Box>
    </Box>
  );
};

export default Dashboard;
