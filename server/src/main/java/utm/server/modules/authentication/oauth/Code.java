package utm.server.modules.authentication.oauth;

import lombok.Data;

@Data
public class Code {
    private String code;
    private String redirectUri;
}
