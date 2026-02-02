import { Container, Step, StepLabel, Stepper } from "@mui/material";

type StepWrapperProps = {
  activeStep: number;
  stepsHeader: string[];
  children?: React.ReactNode;
};

const StepWrapper = ({
  activeStep,
  stepsHeader,
  children,
}: StepWrapperProps) => {
  return (
    <Container>
      <Stepper className="mb-10" activeStep={activeStep}>
        {stepsHeader.map((step, index) => (
          <Step key={index} completed={activeStep > index}>
            <StepLabel>{step}</StepLabel>
          </Step>
        ))}
      </Stepper>
      {children}
    </Container>
  );
};

export default StepWrapper;
