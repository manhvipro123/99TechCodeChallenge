import { Container, CssBaseline } from "@mui/material";
import CurrencySwapForm from "./components/CurrencySwapForm";
import './App.css'

function App() {

  return (
    <Container maxWidth="sm">
      <CssBaseline />
      <CurrencySwapForm />
    </Container>
  );
}

export default App
