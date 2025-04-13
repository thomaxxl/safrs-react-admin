import React, { useEffect, useState } from 'react';
import { Card, CardContent, Typography, CircularProgress, Grid, Box, Divider } from '@mui/material';
import { useDataProvider } from 'react-admin';

const TournamentList = () => {
    const [tournaments, setTournaments] = useState([]);
    const [loading, setLoading] = useState(true);
    const dataProvider = useDataProvider();

    useEffect(() => {
        setLoading(true);
        dataProvider.getList('Tournament', {
            pagination: { page: 1, perPage: 10 },
            meta: { include: ['course'] }
        })
        .then(async ({ data }) => {
            const tournamentsWithCourse = await Promise.all(
                data.map(async (tournament) => {
                    const courseId = tournament.relationships?.course?.data?.id;

                    // Fetch the course details for each tournament
                    const course = await dataProvider.getOne('Course', { id: courseId });
                    return {
                        ...tournament,
                        course: course.data,
                    };
                })
            );

            setTournaments(tournamentsWithCourse);
            setLoading(false);
        })
        .catch((error) => {
            console.error("Error fetching tournaments:", error);
            setLoading(false);
        });
    }, []);

    if (loading) {
        return (
            <Box display="flex" justifyContent="center" alignItems="center" minHeight="100vh">
                <CircularProgress />
            </Box>
        );
    }

    return (
        <Grid container spacing={2}>
            {tournaments.map((tournament) => (
                <Grid item xs={12} sm={6} md={4} key={tournament.id}>
                    <Card>
                        <CardContent>
                            <Typography variant="h6">{tournament.attributes?.name}</Typography>
                            <Typography variant="body1">
                                Date: {new Date(tournament.attributes?.date).toLocaleDateString()}
                            </Typography>
                            <Typography variant="body1">
                                Total Prize Money: ${tournament.attributes?.total_prize_money || 'N/A'}
                            </Typography>
                            <Divider sx={{ my: 2 }} />
                            <Typography variant="body2">
                                Course: {tournament.course?.attributes?.name || 'Unknown'}
                            </Typography>
                            <Typography variant="body2">
                                Location: {tournament.course?.attributes?.location || 'N/A'}
                            </Typography>
                        </CardContent>
                    </Card>
                </Grid>
            ))}
        </Grid>
    );
};

export default TournamentList;
