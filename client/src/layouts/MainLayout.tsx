import { Container } from "@mui/material";
import Navbar from "../components/navbar/navbar";

export interface LayoutProps {
  children?: React.ReactNode;
}

const MainLayout = ({ children }: LayoutProps) => {
  return (
    <>
      <Navbar />
      <Container className="mt-20">{children}</Container>
    </>
  );
};

export default MainLayout;
