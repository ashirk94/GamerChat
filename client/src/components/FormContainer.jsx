import { Container, Row, Col } from "react-bootstrap";

function FormContainer({ children }) {
	return (
		<Container>
			<Row className="justify-content-md-center mt-5">
				<Col xs={12} md={4} className="card p-5 login-container">
					{children}
				</Col>
			</Row>
		</Container>
	);
}

export default FormContainer;
