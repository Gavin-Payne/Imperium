import { colors } from '../theme';

export const darkAppStyle = {
  backgroundColor: colors.background.main,
  color: colors.text.primary,
  minHeight: '100vh',
  display: 'flex',
  flexDirection: 'column',
  fontFamily: 'Arial, sans-serif',
};

export const darkHeaderStyle = {
  textAlign: 'center',
  color: colors.text.primary,
  margin: '20px 0',
};

export const darkContainerStyle = {
  backgroundColor: colors.background.surface,
  padding: '20px',
  borderRadius: '10px',
  boxShadow: '0 2px 5px rgba(0, 0, 0, 0.3)',
  maxWidth: '400px',
  margin: 'auto',
};

export const darkSubscriptButtonStyle = {
  border: 'none',
  background: 'none',
  color: colors.primary,
  cursor: 'pointer',
  textDecoration: 'underline',
  fontSize: '0.9em',
};

export const interfaceContainerStyle = {
  padding: '20px',
  marginBottom: '80px',
  backgroundColor: colors.background.surface,
  minHeight: '100vh',
  width: '100%',
  textAlign: 'center'
};