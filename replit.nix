{ pkgs }: {
  deps = [
    pkgs.nodePackages.vscode-langservers-extracted
    pkgs.nodePackages.typescript-language-server
    pkgs.iputils
    pkgs.nettools
    pkgs.busybox
    pkgs.iproute2
    pkgs.openssh_with_kerberos
    pkgs.pacman
    pkgs.nano
  ];
}