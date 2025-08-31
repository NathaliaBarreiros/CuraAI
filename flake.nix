{
  description = "CuraAI - Web3 Medical AI App with Privy";

  inputs = {
    nixpkgs.url = "github:NixOS/nixpkgs/nixos-unstable";
    flake-utils.url = "github:numtide/flake-utils";
  };

  outputs = { self, nixpkgs, flake-utils }:
    flake-utils.lib.eachDefaultSystem (system:
      let
        pkgs = nixpkgs.legacyPackages.${system};
      in
      {
        devShells.default = pkgs.mkShell {
          buildInputs = with pkgs; [
            # Node.js 20 for Next.js 15 compatibility
            nodejs_20
            
            # Package managers
            npm-check-updates
            
            # Development tools
            git
            
            # Optional: Global TypeScript for better IDE support
            nodePackages.typescript
            nodePackages.typescript-language-server
            
            # Optional: Prettier and ESLint for code formatting
            nodePackages.prettier
            nodePackages.eslint
            nodePackages.pnpm
          ];

          shellHook = ''
            echo "🚀 CuraAI Development Environment"
            echo "Node.js version: $(node --version)"
            echo "npm version: $(npm --version)"
            echo ""
            echo "Available commands:"
            echo "  npm install    - Install dependencies"
            echo "  npm run dev    - Start development server"
            echo "  npm run build  - Build for production"
            echo "  npm run start  - Start production server"
            echo ""
            echo "Environment variables needed:"
            echo "  NEXT_PUBLIC_PRIVY_APP_ID - Your Privy app ID"
            echo ""
            
            # Automatically install dependencies if node_modules doesn't exist
            if [ ! -d "node_modules" ]; then
              echo "Installing dependencies..."
              npm install
            fi
          '';

          # Environment variables
          NEXT_PUBLIC_PRIVY_APP_ID = builtins.getEnv "NEXT_PUBLIC_PRIVY_APP_ID";
        };

        # Optional: Add a package for building the app
        packages.default = pkgs.buildNpmPackage {
          pname = "curaai";
          version = "0.1.0";
          
          src = ./.;
          
          npmDepsHash = "sha256-AAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAAA="; # This will need to be updated
          
          buildPhase = ''
            npm run build
          '';
          
          installPhase = ''
            mkdir -p $out
            cp -r .next $out/
            cp -r public $out/
            cp package.json $out/
          '';
        };
      });
}
