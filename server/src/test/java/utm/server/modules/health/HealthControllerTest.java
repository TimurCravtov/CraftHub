package utm.server.modules.health;

import org.junit.jupiter.api.Test;

import static org.junit.jupiter.api.Assertions.assertEquals;

class HealthControllerTest {

    @Test
    void healthEndpointReturnsUp() {

        HealthController controller = new HealthController();


        var response = controller.health();


        assertEquals(200, response.getStatusCodeValue());
        assertEquals("UP", response.getBody().get("status"));
    }
}