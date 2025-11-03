// client/src/pages/HelpResources.jsx
import React from 'react';
import { Link as RouterLink } from 'react-router-dom'; // Import RouterLink
import {
  Container,
  Typography,
  Paper,
  Box,
  Link as MuiLink,
  useTheme // 1. Import useTheme
} from '@mui/material';
import PhoneIcon from '@mui/icons-material/Phone';
import GppGoodIcon from '@mui/icons-material/GppGood';
import GavelIcon from '@mui/icons-material/Gavel';
import SchoolIcon from '@mui/icons-material/School';
import WarningAmberIcon from '@mui/icons-material/WarningAmber';

export default function HelpResources() {
  const theme = useTheme(); // 2. Get the theme

  const h2Style = {
    borderBottom: '2px solid #eee',
    paddingBottom: '10px',
    marginTop: '40px',
    marginBottom: '20px',
  };

  const contactBoxStyle = {
    // 3. Removed hard-coded background
    border: `1px solid ${theme.palette.divider}`, // Use theme's border color
    borderRadius: '8px',
    padding: '24px',
    marginBottom: '20px',
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
  };

  const dangerStyle = {
    background: theme.palette.mode === 'dark' ? '#5f2120' : '#fff0f0', // Dark/light red
    border: `1px solid ${theme.palette.error.main}`,
    borderRadius: '8px',
    padding: '24px',
    textAlign: 'center',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '10px',
  };

  return (
    <Container maxWidth="md" sx={{ mt: 4, mb: 4 }}>
      <Typography variant="h4" component="h1" gutterBottom>
        Help & Legal Resources
      </Typography>

      <Paper elevation={0} sx={dangerStyle}>
        <WarningAmberIcon color="error" sx={{ fontSize: 40 }} />
        <Typography variant="h5" component="h3" sx={{ fontWeight: 'bold' }}>
          IF YOU ARE IN IMMEDIATE DANGER
        </Typography>
        <Typography>
          This platform is not an emergency service. If you or someone else is in
          immediate physical danger, please contact the Police immediately.
        </Typography>
        <Typography variant="h4" sx={{ color: 'error.main', fontWeight: 'bold', mt: 1 }}>
          Call 119
        </Typography>
      </Paper>

      <Typography variant="h5" component="h2" sx={h2Style}>
        What is Ragging? (The Law)
      </Typography>
      <Typography variant="body1" paragraph>
        Ragging is a serious crime in Sri Lanka. It is defined and prohibited by
        the{' '}
        <strong>
          Prohibition of Ragging and Other Forms of Violence in Educational
          Institutions Act, No. 20 of 1998
        </strong>.
      </Typography>
      <Typography variant="body1" paragraph>
        Under this law, ragging includes (but is not limited to):
      </Typography>
      <ul>
        <li>
          Any act that causes, or is likely to cause, physical or mental harm or
          fear.
        </li>
        <li>Forced sexual activity, sexual harassment, or verbal abuse.</li>
        <li>Forced consumption of food or drink.</li>
        <li>Criminal intimidation, extortion, or forced confinement.</li>
      </ul>
      <Typography variant="body1" paragraph>
        Being found guilty of ragging is a criminal offense and can lead to{' '}
        <strong>up to ten (10) years of rigorous imprisonment</strong> and
        expulsion from your university.
      </Typography>

      <Typography variant="h5" component="h2" sx={h2Style}>
        Who To Contact Immediately
      </Typography>
      <Typography variant="body1" paragraph>
        Do not wait. Report the incident as soon as possible to one or more of
        these authorities.
      </Typography>

      {/* These boxes now use variant="outlined" which respects dark/light mode */}
      <Paper variant="outlined" sx={contactBoxStyle}>
        <PhoneIcon color="error" sx={{ fontSize: 40 }} />
        <Box>
          <Typography variant="h6">1. Sri Lanka Police</Typography>
          <Typography>
            For any criminal act, including physical assault, threats, or
            extortion.
          </Typography>
          <Typography>
            <strong>National Emergency Hotline:</strong> 119
          </Typography>
        </Box>
      </Paper>

      <Paper variant="outlined" sx={contactBoxStyle}>
        <SchoolIcon color="primary" sx={{ fontSize: 40 }} />
        <Box>
          <Typography variant="h6">2. University Grants Commission (UGC)</Typography>
          <Typography>
            The UGC has a dedicated 24/7 hotline specifically for reporting
            ragging incidents in universities.
          </Typography>
          <Typography>
            <strong>UGC Anti-Ragging Hotline:</strong> 0112123700
          </Typography>
        </Box>
      </Paper>
      
      <Paper variant="outlined" sx={contactBoxStyle}>
        <GppGoodIcon color="action" sx={{ fontSize: 40 }} />
        <Box>
          <Typography variant="h6">3. Your University Administration</Typography>
          <Typography>
            You must report the incident to your university officials. They have a
            legal duty to act.
          </Typography>
          <ul>
            <li>The Vice-Chancellor's Office</li>
            <li>The Dean of your Faculty</li>
            <li>The University Marshal or Security Office</li>
          </ul>
        </Box>
      </Paper>

      <Paper variant="outlined" sx={contactBoxStyle}>
        <GavelIcon color="action" sx={{ fontSize: 40 }} />
        <Box>
          <Typography variant="h6">
            4. Human Rights Commission of Sri Lanka (HRCSL)
          </Typography>
          <Typography>
            If you feel your fundamental rights have been violated, you can file a
            complaint with the HRCSL.
          </Typography>
          <Typography>
            <strong>HRCSL Hotline:</strong> 0112505575
          </Typography>
        </Box>
      </Paper>

      <Typography variant="h5" component="h2" sx={h2Style}>
        What to do when reporting
      </Typography>
      <ul>
        <li>
          <strong>Be clear and factual.</strong> State what happened, where it
          happened, when it happened, and who was involved (if you know).
        </li>
        <li>
          <strong>Preserve evidence.</strong> If you have threatening messages,
          photos, or videos, save them securely. Do not delete them.
        </li>
        <li>
          <strong>Write down everything.</strong> Keep a private record of every
          incident, including dates, times, and locations.
        </li>
        <li>
          <strong>Report as a group.</strong> If you were not the only victim,
          try to report with others. There is strength in numbers.
        </li>
      </ul>
    </Container>
  );
}